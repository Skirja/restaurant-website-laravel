<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Table;
use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;

class PublicReservationController extends Controller
{
    const BOOKING_FEE = 100000; // Rp. 100.000

    // Order status constants
    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    // Payment status constants
    const PAYMENT_PENDING = 'pending';
    const PAYMENT_SUCCESS = 'success';
    const PAYMENT_FAILED = 'failed';

    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;
        Config::$curlOptions = [
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HEADER => false,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Accept: application/json',
                'User-Agent: Midtrans-PHP/1.0'
            ],
        ];
        Config::$overrideNotifUrl = route('midtrans.callback');
    }

    public function create()
    {
        return Inertia::render('BookingDinein', [
            'clientKey' => config('services.midtrans.client_key'),
            'flash' => [
                'error' => session('error'),
                'success' => session('success'),
                'snap_token' => session('snap_token'),
                'reservation' => session('reservation'),
                'booking_fee' => session('booking_fee'),
                'message' => session('message'),
            ],
            'auth' => [
                'user' => Auth::user() ? [
                    'name' => Auth::user()->name,
                    'email' => Auth::user()->email,
                ] : null,
            ],
        ]);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'fullName' => 'required|string|max:255',
                'date' => 'required|date|after_or_equal:today',
                'time' => 'required|string',
                'guests' => 'required|integer|min:1|max:20',
                'notes' => 'nullable|string|max:500',
            ]);

            // Validate restaurant hours (10:00 - 22:00)
            $bookingTime = \Carbon\Carbon::createFromFormat('H:i', $request->time);
            $openTime = \Carbon\Carbon::createFromFormat('H:i', '10:00');
            $closeTime = \Carbon\Carbon::createFromFormat('H:i', '22:00');

            if ($bookingTime->lt($openTime) || $bookingTime->gt($closeTime)) {
                return back()->with('error', 'Maaf, reservasi hanya tersedia antara jam 10:00 - 22:00.');
            }

            // Check if booking time is at least 2 hours from now for same-day bookings
            if ($request->date == now()->toDateString() && $bookingTime->diffInHours(now()) < 2) {
                return back()->with('error', 'Reservasi harus dilakukan minimal 2 jam sebelum waktu kedatangan.');
            }

            // Find available table
            $availableTable = Table::whereDoesntHave('reservations', function ($query) use ($request) {
                $query->where('reservation_date', $request->date)
                    ->where('reservation_time', $request->time)
                    ->whereIn('status', ['pending', 'confirmed']);
            })
                ->where('capacity', '>=', $request->guests)
                ->where('status', 'available')
                ->first();

            if (!$availableTable) {
                return back()->with('error', 'Maaf, tidak ada meja yang tersedia untuk jumlah tamu dan waktu yang dipilih.');
            }

            DB::beginTransaction();
            try {
                // Create reservation with correct data
                $reservation = Reservation::create([
                    'user_id' => Auth::id(),
                    'table_id' => $availableTable->id,
                    'reservation_date' => $request->date,
                    'reservation_time' => $request->time,
                    'number_of_guests' => $request->guests,
                    'special_requests' => $request->notes,
                    'status' => 'pending',
                ]);

                // Set up Midtrans payment
                $params = [
                    'transaction_details' => [
                        'order_id' => 'BOOKING-' . $reservation->id,
                        'gross_amount' => (int) self::BOOKING_FEE,
                    ],
                    'customer_details' => [
                        'first_name' => $request->fullName,
                        'email' => Auth::user()->email,
                    ],
                    'item_details' => [
                        [
                            'id' => 'BOOKING-FEE',
                            'price' => (int) self::BOOKING_FEE,
                            'quantity' => 1,
                            'name' => 'Booking Fee - Meja ' . $availableTable->table_number,
                        ],
                    ],
                    'enabled_payments' => [
                        'credit_card',
                        'bca_va',
                        'bni_va',
                        'bri_va',
                        'gopay',
                        'shopeepay'
                    ],
                    'callbacks' => [
                        'finish' => route('reservations.finish'),
                        'error' => route('reservations.error'),
                        'cancel' => route('reservations.cancel'),
                    ],
                ];

                Log::info('Midtrans Parameters:', $params);

                $snapToken = Snap::getSnapToken($params);
                Log::info('Snap Token Generated:', ['token' => $snapToken]);

                DB::commit();

                return back()->with([
                    'snap_token' => $snapToken,
                    'booking_fee' => self::BOOKING_FEE,
                    'success' => true,
                    'reservation_id' => $reservation->id
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Midtrans Snap Token Error:', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);

                return back()->with('error', 'Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage());
            }
        } catch (\Exception $e) {
            Log::error('Reservation Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage());
        }
    }

    public function checkAvailability(Request $request)
    {
        try {
            $request->validate([
                'date' => 'required|date|after_or_equal:today',
                'time' => 'required|string',
                'guests' => 'required|integer|min:1|max:20',
            ]);

            // Validate restaurant hours (10:00 - 22:00)
            $bookingTime = \Carbon\Carbon::createFromFormat('H:i', $request->time);
            $openTime = \Carbon\Carbon::createFromFormat('H:i', '10:00');
            $closeTime = \Carbon\Carbon::createFromFormat('H:i', '22:00');

            if ($bookingTime->lt($openTime) || $bookingTime->gt($closeTime)) {
                return response()->json([
                    'available' => false,
                    'message' => 'Maaf, reservasi hanya tersedia antara jam 10:00 - 22:00.'
                ]);
            }

            // Check if booking time is at least 2 hours from now for same-day bookings
            if ($request->date == now()->toDateString() && $bookingTime->diffInHours(now()) < 2) {
                return response()->json([
                    'available' => false,
                    'message' => 'Reservasi harus dilakukan minimal 2 jam sebelum waktu kedatangan.'
                ]);
            }

            // Find available tables
            $availableTable = Table::whereDoesntHave('reservations', function ($query) use ($request) {
                $query->where('reservation_date', $request->date)
                    ->where('reservation_time', $request->time)
                    ->whereIn('status', ['pending', 'confirmed']);
            })
                ->where('capacity', '>=', $request->guests)
                ->exists();

            return response()->json([
                'available' => $availableTable,
                'message' => $availableTable ? 'Meja tersedia' : 'Maaf, tidak ada meja yang tersedia untuk jumlah tamu dan waktu yang dipilih.'
            ]);
        } catch (\Exception $e) {
            Log::error('Check Availability Error: ' . $e->getMessage());
            return response()->json([
                'available' => false,
                'message' => 'Terjadi kesalahan saat memeriksa ketersediaan meja.'
            ], 500);
        }
    }

    public function handlePaymentCallback(Request $request)
    {
        try {
            Log::info('Midtrans Callback Received:', $request->all());

            // Get notification instance
            $notification = new Notification();

            // Get notification data
            $notificationData = $notification->getResponse();
            Log::info('Raw Notification Data:', ['data' => $notificationData]);

            // Get order ID and transaction status
            $orderId = $notificationData->order_id ?? null;
            $transactionStatus = $notificationData->transaction_status ?? null;
            $transactionId = $notificationData->transaction_id ?? null;

            if (!$orderId || !$transactionStatus) {
                Log::error('Missing required notification data', [
                    'order_id' => $orderId,
                    'status' => $transactionStatus
                ]);
                return response()->json(['status' => 'error', 'message' => 'Invalid notification data'], 400);
            }

            // Extract reservation ID from order ID (format: BOOKING-{uuid})
            $reservationId = str_replace('BOOKING-', '', $orderId);

            Log::info('Processing reservation:', [
                'reservation_id' => $reservationId,
                'transaction_status' => $transactionStatus
            ]);

            // Find reservation
            $reservation = Reservation::where('id', $reservationId)->first();
            if (!$reservation) {
                Log::error('Reservation not found:', ['reservation_id' => $reservationId]);
                return response()->json(['status' => 'error', 'message' => 'Reservation not found'], 404);
            }

            DB::beginTransaction();
            try {
                // Create or update payment record
                $payment = Payment::updateOrCreate(
                    ['transaction_id' => $transactionId],
                    [
                        'order_id' => $orderId,
                        'amount' => floatval($notificationData->gross_amount ?? 0),
                        'payment_method' => $notificationData->payment_type ?? 'unknown',
                        'status' => $transactionStatus
                    ]
                );

                Log::info('Payment record created/updated:', ['payment_id' => $payment->id]);

                // Update reservation payment ID if not set
                if (!$reservation->payment_id) {
                    $reservation->payment_id = $payment->id;
                }

                // Update reservation and table status based on payment status
                if ($transactionStatus == 'capture' || $transactionStatus == 'settlement') {
                    $reservation->status = 'confirmed';

                    // Update table status
                    $table = Table::find($reservation->table_id);
                    if ($table) {
                        $table->status = 'reserved';
                        $table->save();

                        Log::info('Table status updated:', [
                            'table_id' => $table->id,
                            'status' => $table->status
                        ]);
                    }

                    Log::info('Reservation confirmed:', ['reservation_id' => $reservation->id]);
                } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                    $reservation->status = 'cancelled';
                    Log::info('Reservation cancelled:', ['reservation_id' => $reservation->id]);
                } elseif ($transactionStatus == 'pending') {
                    $reservation->status = 'pending';
                    Log::info('Reservation pending:', ['reservation_id' => $reservation->id]);
                }

                // Save reservation changes
                $reservation->save();

                DB::commit();
                Log::info('Transaction committed successfully');

                return response()->json(['status' => 'success']);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error in payment callback transaction:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('Payment callback error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function handlePaymentFinish(Request $request)
    {
        try {
            Log::info('Payment finish callback received:', $request->all());

            // Extract reservation ID from the request (format: BOOKING-{uuid})
            $reservationId = $request->order_id;
            $reservationId = str_replace('BOOKING-', '', $reservationId);

            Log::info('Processing reservation:', [
                'reservation_id' => $reservationId,
                'transaction_status' => $request->transaction_status
            ]);

            // Find reservation
            $reservation = Reservation::find($reservationId);
            if (!$reservation) {
                Log::error('Reservation not found:', ['reservation_id' => $reservationId]);
                return redirect()->route('reservations.create')
                    ->with('error', 'Reservasi tidak ditemukan.');
            }

            DB::beginTransaction();
            try {
                // Create or update payment record
                $payment = Payment::updateOrCreate(
                    ['transaction_id' => $request->transaction_id],
                    [
                        'order_id' => $reservationId,
                        'amount' => self::BOOKING_FEE,
                        'payment_method' => $request->payment_type ?? 'unknown',
                        'status' => $request->transaction_status
                    ]
                );

                Log::info('Payment record created/updated:', ['payment' => $payment->toArray()]);

                // Update reservation and table status based on payment status
                if (in_array($request->transaction_status, ['capture', 'settlement'])) {
                    $reservation->update([
                        'status' => 'confirmed',
                        'payment_id' => $payment->id
                    ]);

                    // Update table status
                    $table = Table::find($reservation->table_id);
                    if ($table) {
                        $table->update(['status' => 'reserved']);
                    }

                    Log::info('Reservation confirmed:', [
                        'reservation_id' => $reservation->id,
                        'payment_id' => $payment->id,
                        'table_id' => $table->id
                    ]);
                }

                DB::commit();

                return redirect()->route('reservations.create')
                    ->with('success', 'Pembayaran berhasil diproses. Terima kasih atas reservasi Anda.');
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error updating payment status:', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('Error in payment finish:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('reservations.create')
                ->with('error', 'Terjadi kesalahan saat memproses konfirmasi pembayaran.');
        }
    }

    public function handlePaymentError(Request $request)
    {
        $reservationId = session('reservation_id');
        if ($reservationId) {
            $reservation = Reservation::find($reservationId);
            if ($reservation) {
                $reservation->cancel('Pembayaran gagal');
            }
        }

        return redirect()->route('reservations.create')
            ->with('error', 'Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.');
    }

    public function handlePaymentCancel(Request $request)
    {
        $reservationId = session('reservation_id');
        if ($reservationId) {
            $reservation = Reservation::find($reservationId);
            if ($reservation) {
                $reservation->cancel('Pembayaran dibatalkan oleh pengguna');
            }
        }

        return redirect()->route('reservations.create')
            ->with('error', 'Pembayaran dibatalkan. Silakan coba lagi jika ingin melanjutkan reservasi.');
    }
}
