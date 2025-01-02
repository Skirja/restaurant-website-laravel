<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['user', 'items.menuItem', 'payment'])
            ->latest()
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'customer_name' => $order->user->name,
                    'order_type' => $order->order_type,
                    'status' => $order->status,
                    'total_amount' => $order->total_amount,
                    'payment_status' => $order->payment_status,
                    'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                    'items' => $order->items->map(function ($item) {
                        return [
                            'name' => $item->menuItem->name,
                            'quantity' => $item->quantity,
                            'unit_price' => $item->unit_price,
                            'subtotal' => $item->subtotal,
                        ];
                    }),
                    'payment' => $order->payment ? [
                        'method' => $order->payment->payment_method,
                        'status' => $order->payment->status,
                    ] : null,
                ];
            });

        return Inertia::render('Admin/Order/Index', [
            'orders' => $orders,
        ]);
    }

    public function show(Order $order)
    {
        $order->load(['user', 'items.menuItem', 'payment']);

        return Inertia::render('Admin/Order/Show', [
            'order' => [
                'id' => $order->id,
                'customer' => [
                    'name' => $order->user->name,
                    'email' => $order->user->email,
                    'phone' => $order->user->phone_number,
                ],
                'order_type' => $order->order_type,
                'status' => $order->status,
                'total_amount' => $order->total_amount,
                'discount_amount' => $order->discount_amount,
                'payment_status' => $order->payment_status,
                'delivery_address' => $order->delivery_address,
                'estimated_delivery_time' => $order->estimated_delivery_time,
                'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                'items' => $order->items->map(function ($item) {
                    return [
                        'name' => $item->menuItem->name,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'subtotal' => $item->subtotal,
                    ];
                }),
                'payment' => $order->payment ? [
                    'method' => $order->payment->payment_method,
                    'transaction_id' => $order->payment->transaction_id,
                    'status' => $order->payment->status,
                    'amount' => $order->payment->amount,
                ] : null,
            ],
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled',
            'payment_status' => 'required|string',
        ]);

        $order->update($validated);

        return redirect()->back();
    }

    public function destroy(Order $order)
    {
        if ($order->status === 'completed') {
            return redirect()->back()->with('error', 'Cannot delete completed orders.');
        }

        $order->delete();

        return redirect()->route('admin.orders.index')->with('success', 'Order deleted successfully.');
    }
}
