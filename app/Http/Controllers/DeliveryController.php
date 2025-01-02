<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Discount;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;

class DeliveryController extends Controller
{
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
        Config::$overrideNotifUrl = route('delivery.callback');
    }

    public function create()
    {
        return Inertia::render('DeliveryCheckout', [
            'clientKey' => config('services.midtrans.client_key'),
            'flash' => [
                'error' => session('error'),
                'success' => session('success'),
                'snap_token' => session('snap_token'),
                'order' => session('order'),
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

    public function checkout(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'name' => 'required|string',
            'phone' => 'required|string',
            'email' => 'required|email',
            'address' => 'required|string',
            'notes' => 'nullable|string',
            'deliveryTime' => 'required|string',
            'cart' => 'required|string',
            'discount_code' => 'nullable|string'
        ]);

        $cart = json_decode($request->cart, true);
        $originalTotal = collect($cart)->sum(fn($item) => $item['price'] * $item['quantity']);
        $total = $originalTotal;
        $discountAmount = 0;
        $discount = null;

        if ($request->discount_code) {
            $discount = Discount::where('code', $request->discount_code)
                ->where('is_active', true)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->first();

            if ($discount) {
                $discountAmount = $discount->type === 'percentage'
                    ? (int)($originalTotal * $discount->value / 100)
                    : (int)$discount->value;
                $total = $originalTotal - $discountAmount;
            }
        }

        DB::beginTransaction();
        try {
            $order = Order::create([
                'user_id' => $user->getAuthIdentifier(),
                'order_type' => 'delivery',
                'status' => Order::STATUS_PENDING,
                'total_amount' => $request->total_amount,
                'payment_status' => 'pending',
                'delivery_address' => $request->address,
                'estimated_delivery_time' => $request->deliveryTime,
                'discount_code' => $discount ? $discount->code : null,
                'discount_amount' => $discountAmount
            ]);

            foreach ($cart as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $item['id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'subtotal' => $item['price'] * $item['quantity']
                ]);
            }

            DB::commit();

            // Set your Merchant Server Key
            Config::$serverKey = config('services.midtrans.server_key');
            // Set to Development/Sandbox Environment (default). Set to true for Production Environment (accept real transaction).
            Config::$isProduction = config('services.midtrans.is_production', false);
            // Set sanitization on (default)
            Config::$isSanitized = true;
            // Set 3DS transaction for credit card to true
            Config::$is3ds = true;

            $params = array(
                'transaction_details' => array(
                    'order_id' => 'ORDER-' . $order->id,
                    'gross_amount' => (int) $request->total_amount,
                ),
                'customer_details' => array(
                    'first_name' => $request->name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                ),
                'item_details' => array_merge(
                    collect($cart)->map(fn($item) => [
                        'id' => $item['id'],
                        'price' => (int) $item['price'],
                        'quantity' => $item['quantity'],
                        'name' => $item['name'],
                    ])->toArray(),
                    $request->total_amount < collect($cart)->sum(fn($item) => $item['price'] * $item['quantity']) ? [[
                        'id' => 'DISCOUNT',
                        'price' => (int) ($request->total_amount - collect($cart)->sum(fn($item) => $item['price'] * $item['quantity'])),
                        'quantity' => 1,
                        'name' => 'Discount',
                    ]] : []
                ),
                'enabled_payments' => [
                    'credit_card',
                    'bca_va',
                    'bni_va',
                    'bri_va',
                    'gopay',
                    'shopeepay'
                ],
                'callbacks' => [
                    'finish' => route('delivery.finish'),
                    'error' => route('delivery.error'),
                    'cancel' => route('delivery.cancel'),
                ],
            );

            try {
                // Get Snap Payment Page URL
                $snapToken = Snap::getSnapToken($params);
                Log::info('Snap Token Generated:', ['token' => $snapToken]);

                return back()->with([
                    'snap_token' => $snapToken,
                    'success' => true,
                    'order_id' => $order->id
                ]);
            } catch (\Exception $e) {
                Log::error('Midtrans Snap Token Error:', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);

                return back()->with('error', 'Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage());
            }
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in payment callback transaction:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
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

            // Extract order ID from order ID (format: ORDER-{uuid})
            $orderId = str_replace('ORDER-', '', $orderId);

            Log::info('Processing order:', [
                'order_id' => $orderId,
                'transaction_status' => $transactionStatus
            ]);

            // Find order
            $order = Order::where('id', $orderId)->first();
            if (!$order) {
                Log::error('Order not found:', ['order_id' => $orderId]);
                return response()->json(['status' => 'error', 'message' => 'Order not found'], 404);
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

                // Update order payment ID if not set
                if (!$order->payment_id) {
                    $order->payment_id = $payment->id;
                }

                // Update order status based on payment status
                if ($transactionStatus == 'capture' || $transactionStatus == 'settlement') {
                    $order->status = Order::STATUS_PROCESSING;
                    $order->payment_status = Payment::STATUS_SUCCESS;
                } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                    $order->status = Order::STATUS_CANCELLED;
                    $order->payment_status = Payment::STATUS_FAILED;
                } elseif ($transactionStatus == 'pending') {
                    $order->status = Order::STATUS_PENDING;
                    $order->payment_status = Payment::STATUS_PENDING;
                }

                // Save order changes
                $order->save();

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

            // Extract order ID from the request (format: ORDER-{uuid})
            $orderId = $request->order_id;
            $orderId = str_replace('ORDER-', '', $orderId);

            Log::info('Processing order:', [
                'order_id' => $orderId,
                'transaction_status' => $request->transaction_status
            ]);

            // Find order
            $order = Order::find($orderId);
            if (!$order) {
                Log::error('Order not found:', ['order_id' => $orderId]);
                return redirect()->route('delivery-checkout')
                    ->with('error', 'Pesanan tidak ditemukan.');
            }

            DB::beginTransaction();
            try {
                // Create or update payment record
                $payment = Payment::updateOrCreate(
                    ['transaction_id' => $request->transaction_id],
                    [
                        'order_id' => $orderId,
                        'amount' => $order->total_amount,
                        'payment_method' => $request->payment_type ?? 'unknown',
                        'status' => $request->transaction_status
                    ]
                );

                Log::info('Payment record created/updated:', ['payment' => $payment->toArray()]);

                // Update order status based on payment status
                if (in_array($request->transaction_status, ['capture', 'settlement'])) {
                    $order->update([
                        'status' => self::STATUS_COMPLETED,
                        'payment_status' => self::PAYMENT_SUCCESS,
                        'payment_id' => $payment->id
                    ]);

                    Log::info('Order completed:', [
                        'order_id' => $order->id,
                        'payment_id' => $payment->id
                    ]);
                }

                DB::commit();

                return redirect()->route('delivery-checkout')
                    ->with('success', 'Pembayaran berhasil diproses. Terima kasih atas pesanan Anda.');
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

            return redirect()->route('delivery-checkout')
                ->with('error', 'Terjadi kesalahan saat memproses konfirmasi pembayaran.');
        }
    }

    public function handlePaymentError()
    {
        $orderId = session('order_id');
        if ($orderId) {
            $order = Order::find($orderId);
            if ($order) {
                $order->update([
                    'status' => Order::STATUS_CANCELLED,
                    'payment_status' => Payment::STATUS_FAILED
                ]);
            }
        }

        return redirect()->route('delivery-checkout')
            ->with('error', 'Pembayaran gagal. Silakan coba lagi.');
    }

    public function handlePaymentCancel()
    {
        $orderId = session('order_id');
        if ($orderId) {
            $order = Order::find($orderId);
            if ($order) {
                $order->update([
                    'status' => Order::STATUS_CANCELLED,
                    'payment_status' => Payment::STATUS_FAILED
                ]);
            }
        }

        return redirect()->route('delivery-checkout')
            ->with('error', 'Pembayaran dibatalkan. Silakan coba lagi jika ingin melanjutkan pesanan.');
    }
}
