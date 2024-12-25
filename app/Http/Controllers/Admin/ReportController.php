<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\MenuItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->input('period', 'daily');
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));

        // Get sales data based on period
        $salesData = $this->getSalesData($period, $startDate, $endDate);

        // Get top selling items
        $topSellingItems = MenuItem::select('menu_items.name', DB::raw('SUM(order_items.quantity) as total_quantity'))
            ->join('order_items', 'menu_items.id', '=', 'order_items.menu_item_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'completed')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->groupBy('menu_items.id', 'menu_items.name')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get();

        // Get sales summary
        $summary = [
            'total_orders' => Order::where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'total_revenue' => Order::where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('total_amount'),
            'average_order_value' => Order::where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->avg('total_amount') ?? 0,
        ];

        // Get order type distribution
        $orderTypes = Order::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select('order_type', DB::raw('COUNT(*) as count'))
            ->groupBy('order_type')
            ->get();

        return Inertia::render('Admin/Report/Index', [
            'salesData' => $salesData,
            'topSellingItems' => $topSellingItems,
            'summary' => $summary,
            'orderTypes' => $orderTypes,
            'filters' => [
                'period' => $period,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    private function getSalesData($period, $startDate, $endDate)
    {
        $query = Order::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate]);

        switch ($period) {
            case 'daily':
                $query->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as total_orders'),
                    DB::raw('SUM(total_amount) as total_sales')
                )
                ->groupBy(DB::raw('DATE(created_at)'));
                break;

            case 'monthly':
                $query->select(
                    DB::raw('DATE_FORMAT(created_at, "%Y-%m") as date'),
                    DB::raw('COUNT(*) as total_orders'),
                    DB::raw('SUM(total_amount) as total_sales')
                )
                ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m")'));
                break;

            case 'yearly':
                $query->select(
                    DB::raw('YEAR(created_at) as date'),
                    DB::raw('COUNT(*) as total_orders'),
                    DB::raw('SUM(total_amount) as total_sales')
                )
                ->groupBy(DB::raw('YEAR(created_at)'));
                break;
        }

        return $query->orderBy('date')->get();
    }

    public function export(Request $request)
    {
        $period = $request->input('period', 'daily');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Get sales data
        $salesData = $this->getSalesData($period, $startDate, $endDate);

        // Format data for export
        $data = $salesData->map(function ($item) use ($period) {
            return [
                'Date' => $period === 'yearly' ? $item->date : Carbon::parse($item->date)->format('Y-m-d'),
                'Total Orders' => $item->total_orders,
                'Total Sales' => number_format($item->total_sales, 2),
            ];
        });

        // Generate CSV
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="sales-report.csv"',
        ];

        $callback = function () use ($data) {
            $file = fopen('php://output', 'w');
            fputcsv($file, array_keys($data->first()));

            foreach ($data as $row) {
                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
