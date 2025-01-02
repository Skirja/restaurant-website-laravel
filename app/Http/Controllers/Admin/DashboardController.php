<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'recent_orders' => Order::with(['user', 'items.menuItem'])
                ->latest()
                ->take(5)
                ->get(),
            'total_orders' => Order::count(),
            'total_revenue' => Order::where('payment_status', Payment::STATUS_SUCCESS)->sum('total_amount'),
            'total_customers' => User::where('role', '!=', 'admin')->count(),
            'active_reservations' => Reservation::where('status', 'confirmed')->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats
        ]);
    }
}
