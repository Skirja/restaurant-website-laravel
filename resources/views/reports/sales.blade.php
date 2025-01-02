<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Sales Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            color: #92400E;
            margin-bottom: 10px;
        }

        .summary {
            margin-bottom: 30px;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }

        .summary-item {
            background: #FEF3C7;
            padding: 15px;
            border-radius: 8px;
        }

        .summary-item h3 {
            color: #92400E;
            margin: 0 0 10px 0;
        }

        .summary-item p {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            color: #92400E;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f5f5f5;
        }

        tr:nth-child(even) {
            background-color: #FEF3C7;
        }

        .section {
            margin-bottom: 30px;
        }

        .section h2 {
            color: #92400E;
            margin-bottom: 15px;
        }

        .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>Sales Report</h1>
        <p>Period: {{ ucfirst($period) }}</p>
        <p>{{ $startDate }} - {{ $endDate }}</p>
    </div>

    <div class="summary section">
        <div class="section-title">Summary</div>
        <table>
            <tr>
                <th>Total Orders</th>
                <td>{{ $summary->total_orders ?? 0 }}</td>
            </tr>
            <tr>
                <th>Total Revenue</th>
                <td>Rp {{ number_format($summary->total_revenue ?? 0, 2, ',', '.') }}</td>
            </tr>
            <tr>
                <th>Average Order Value</th>
                <td>Rp {{ number_format($summary->average_order_value ?? 0, 2, ',', '.') }}</td>
            </tr>
        </table>
    </div>

    <div class="sales-data section">
        <div class="section-title">Sales Data</div>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Total Orders</th>
                    <th>Total Sales</th>
                </tr>
            </thead>
            <tbody>
                @foreach($salesData as $data)
                <tr>
                    <td>{{ $data->date }}</td>
                    <td>{{ $data->total_orders }}</td>
                    <td>Rp {{ number_format($data->total_sales, 2, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="top-selling section">
        <div class="section-title">Top Selling Items</div>
        <table>
            <thead>
                <tr>
                    <th>Item Name</th>
                    <th>Total Quantity</th>
                </tr>
            </thead>
            <tbody>
                @foreach($topSellingItems as $item)
                <tr>
                    <td>{{ $item->name }}</td>
                    <td>{{ $item->total_quantity }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="order-types section">
        <div class="section-title">Order Type Distribution</div>
        <table>
            <thead>
                <tr>
                    <th>Order Type</th>
                    <th>Count</th>
                </tr>
            </thead>
            <tbody>
                @foreach($orderTypes as $type)
                <tr>
                    <td>{{ $type->order_type }}</td>
                    <td>{{ $type->count }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</body>

</html>