<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Table;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    public function index()
    {
        $reservations = Reservation::with(['user', 'table'])
            ->latest()
            ->get()
            ->map(function ($reservation) {
                return [
                    'id' => $reservation->id,
                    'customer' => [
                        'name' => $reservation->user->name,
                        'email' => $reservation->user->email,
                        'phone' => $reservation->user->phone_number,
                    ],
                    'table_number' => $reservation->table->table_number,
                    'date' => $reservation->reservation_date->format('Y-m-d'),
                    'time' => $reservation->reservation_time->format('H:i'),
                    'guests' => $reservation->number_of_guests,
                    'status' => $reservation->status,
                    'special_requests' => $reservation->special_requests,
                    'created_at' => $reservation->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Reservation/Index', [
            'reservations' => $reservations,
        ]);
    }

    public function create()
    {
        $tables = Table::all()->map(function ($table) {
            return [
                'id' => $table->id,
                'table_number' => $table->table_number,
                'capacity' => $table->capacity,
                'status' => $table->status,
            ];
        });

        return Inertia::render('Admin/Reservation/Form', [
            'tables' => $tables,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'table_id' => 'required|exists:tables,id',
            'reservation_date' => 'required|date|after_or_equal:today',
            'reservation_time' => 'required|date_format:H:i',
            'number_of_guests' => 'required|integer|min:1',
            'special_requests' => 'nullable|string',
        ]);

        // Check table availability
        if (!$this->isTableAvailable($validated['table_id'], $validated['reservation_date'], $validated['reservation_time'])) {
            return back()->withErrors([
                'table_id' => 'This table is not available at the selected time.',
            ]);
        }

        // Check table capacity
        $table = Table::find($validated['table_id']);
        if ($validated['number_of_guests'] > $table->capacity) {
            return back()->withErrors([
                'number_of_guests' => 'The number of guests exceeds the table capacity.',
            ]);
        }

        // Create reservation
        $validated['status'] = 'pending';
        $reservation = Reservation::create($validated);

        // Update table status
        $table->update(['status' => 'reserved']);

        return redirect()->route('admin.reservations.index')
            ->with('success', 'Reservation created successfully.');
    }

    public function show(Reservation $reservation)
    {
        $reservation->load(['user', 'table']);

        return Inertia::render('Admin/Reservation/Show', [
            'reservation' => [
                'id' => $reservation->id,
                'customer' => [
                    'name' => $reservation->user->name,
                    'email' => $reservation->user->email,
                    'phone' => $reservation->user->phone_number,
                ],
                'table' => [
                    'number' => $reservation->table->table_number,
                    'capacity' => $reservation->table->capacity,
                ],
                'date' => $reservation->reservation_date->format('Y-m-d'),
                'time' => $reservation->reservation_time->format('H:i'),
                'guests' => $reservation->number_of_guests,
                'status' => $reservation->status,
                'special_requests' => $reservation->special_requests,
                'created_at' => $reservation->created_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    public function updateStatus(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled',
        ]);

        $oldStatus = $reservation->status;
        $reservation->update($validated);

        // Update table status based on reservation status
        if ($validated['status'] === 'confirmed' && $oldStatus !== 'confirmed') {
            $reservation->table->update(['status' => 'reserved']);
        } elseif ($validated['status'] === 'cancelled' && $oldStatus !== 'cancelled') {
            $reservation->table->update(['status' => 'available']);
        }

        return back()->with('success', 'Reservation status updated successfully.');
    }

    public function destroy(Reservation $reservation)
    {
        // Make table available if reservation is cancelled
        if ($reservation->status === 'confirmed') {
            $reservation->table->update(['status' => 'available']);
        }

        $reservation->delete();

        return redirect()->route('admin.reservations.index')
            ->with('success', 'Reservation deleted successfully.');
    }

    public function checkAvailability(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i',
            'guests' => 'required|integer|min:1',
        ]);

        $availableTables = $this->getAvailableTables(
            $validated['date'],
            $validated['time'],
            $validated['guests']
        );

        return response()->json([
            'available_tables' => $availableTables,
        ]);
    }

    private function isTableAvailable($tableId, $date, $time)
    {
        $reservationDateTime = Carbon::parse("$date $time");
        $timeWindow = [
            $reservationDateTime->copy()->subHours(2),
            $reservationDateTime->copy()->addHours(2),
        ];

        return !Reservation::where('table_id', $tableId)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($timeWindow) {
                $query->whereBetween('reservation_date', [$timeWindow[0]->toDateString(), $timeWindow[1]->toDateString()])
                    ->where(function ($q) use ($timeWindow) {
                        $q->whereBetween(DB::raw('CONCAT(reservation_date, " ", reservation_time)'), [
                            $timeWindow[0]->format('Y-m-d H:i:s'),
                            $timeWindow[1]->format('Y-m-d H:i:s'),
                        ]);
                    });
            })
            ->exists();
    }

    private function getAvailableTables($date, $time, $guests)
    {
        return Table::where('capacity', '>=', $guests)
            ->where('status', 'available')
            ->whereNotIn('id', function ($query) use ($date, $time) {
                $reservationDateTime = Carbon::parse("$date $time");
                $timeWindow = [
                    $reservationDateTime->copy()->subHours(2),
                    $reservationDateTime->copy()->addHours(2),
                ];

                $query->select('table_id')
                    ->from('reservations')
                    ->where('status', '!=', 'cancelled')
                    ->whereBetween('reservation_date', [$timeWindow[0]->toDateString(), $timeWindow[1]->toDateString()])
                    ->where(function ($q) use ($timeWindow) {
                        $q->whereBetween(DB::raw('CONCAT(reservation_date, " ", reservation_time)'), [
                            $timeWindow[0]->format('Y-m-d H:i:s'),
                            $timeWindow[1]->format('Y-m-d H:i:s'),
                        ]);
                    });
            })
            ->get()
            ->map(function ($table) {
                return [
                    'id' => $table->id,
                    'table_number' => $table->table_number,
                    'capacity' => $table->capacity,
                ];
            });
    }
}
