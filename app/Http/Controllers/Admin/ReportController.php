<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->input('period', 'daily');
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));

        // Query untuk sales data berdasarkan periode
        $salesData = Order::where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->when($period === 'daily', function ($query) {
                return $query->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as total_orders'),
                    DB::raw('SUM(total_amount) as total_sales')
                )
                    ->groupBy(DB::raw('DATE(created_at)'));
            })
            ->when($period === 'monthly', function ($query) {
                return $query->select(
                    DB::raw('DATE_FORMAT(created_at, "%Y-%m-01") as date'),
                    DB::raw('COUNT(*) as total_orders'),
                    DB::raw('SUM(total_amount) as total_sales')
                )
                    ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m")'));
            })
            ->when($period === 'yearly', function ($query) {
                return $query->select(
                    DB::raw('YEAR(created_at) as date'),
                    DB::raw('COUNT(*) as total_orders'),
                    DB::raw('SUM(total_amount) as total_sales')
                )
                    ->groupBy(DB::raw('YEAR(created_at)'));
            })
            ->orderBy('date')
            ->get();

        // Query untuk top selling items
        $topSellingItems = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->where('orders.status', Order::STATUS_COMPLETED)
            ->whereBetween('orders.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->select(
                'menu_items.name',
                DB::raw('SUM(order_items.quantity) as total_quantity')
            )
            ->groupBy('menu_items.id', 'menu_items.name')
            ->orderByDesc('total_quantity')
            ->limit(10)
            ->get();

        // Query untuk summary
        $summary = Order::where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->select(
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total_amount) as total_revenue'),
                DB::raw('AVG(total_amount) as average_order_value')
            )
            ->first();

        // Query untuk order types
        $orderTypes = Order::where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->select('order_type', DB::raw('COUNT(*) as count'))
            ->groupBy('order_type')
            ->get();

        return Inertia::render('Admin/Report/Index', [
            'salesData' => $salesData,
            'topSellingItems' => $topSellingItems,
            'summary' => [
                'total_orders' => $summary->total_orders ?? 0,
                'total_revenue' => $summary->total_revenue ?? 0,
                'average_order_value' => $summary->average_order_value ?? 0,
            ],
            'orderTypes' => $orderTypes,
            'filters' => [
                'period' => $period,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function export(Request $request)
    {
        $period = $request->input('period', 'daily');
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));

        // Get the same data as index method
        $salesData = Order::where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->when($period === 'daily', function ($query) {
                return $query->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as total_orders'),
                    DB::raw('SUM(total_amount) as total_sales')
                )
                    ->groupBy(DB::raw('DATE(created_at)'));
            })
            ->when($period === 'monthly', function ($query) {
                return $query->select(
                    DB::raw('DATE_FORMAT(created_at, "%Y-%m-01") as date'),
                    DB::raw('COUNT(*) as total_orders'),
                    DB::raw('SUM(total_amount) as total_sales')
                )
                    ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m")'));
            })
            ->when($period === 'yearly', function ($query) {
                return $query->select(
                    DB::raw('YEAR(created_at) as date'),
                    DB::raw('COUNT(*) as total_orders'),
                    DB::raw('SUM(total_amount) as total_sales')
                )
                    ->groupBy(DB::raw('YEAR(created_at)'));
            })
            ->orderBy('date')
            ->get();

        $topSellingItems = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->where('orders.status', Order::STATUS_COMPLETED)
            ->whereBetween('orders.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->select(
                'menu_items.name',
                DB::raw('SUM(order_items.quantity) as total_quantity')
            )
            ->groupBy('menu_items.id', 'menu_items.name')
            ->orderByDesc('total_quantity')
            ->limit(10)
            ->get();

        $summary = Order::where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->select(
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total_amount) as total_revenue'),
                DB::raw('AVG(total_amount) as average_order_value')
            )
            ->first();

        $orderTypes = Order::where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->select('order_type', DB::raw('COUNT(*) as count'))
            ->groupBy('order_type')
            ->get();

        // Generate PDF
        $pdf = PDF::loadView('reports.sales', [
            'salesData' => $salesData,
            'topSellingItems' => $topSellingItems,
            'summary' => $summary,
            'orderTypes' => $orderTypes,
            'period' => $period,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);

        return $pdf->download('sales-report.pdf');
    }
}
