import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { format } from 'date-fns';
import { Download } from 'lucide-react';

interface SalesData {
    date: string;
    total_orders: number;
    total_sales: number;
}

interface TopSellingItem {
    name: string;
    total_quantity: number;
}

interface OrderType {
    order_type: 'dine-in' | 'takeaway' | 'delivery';
    count: number;
}

interface Props {
    salesData: SalesData[];
    topSellingItems: TopSellingItem[];
    summary: {
        total_orders: number;
        total_revenue: number;
        average_order_value: number;
    };
    orderTypes: OrderType[];
    filters: {
        period: string;
        start_date: string;
        end_date: string;
    };
}

const COLORS = ['#F59E0B', '#D97706', '#B45309'];

export default function Index({ salesData, topSellingItems, summary, orderTypes, filters }: Props) {
    const [period, setPeriod] = useState(filters.period);
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilter = () => {
        router.get(route('admin.reports.index'), {
            period,
            start_date: startDate,
            end_date: endDate,
        }, {
            preserveState: true,
        });
    };

    const handleExport = () => {
        window.location.href = route('admin.reports.export', {
            period,
            start_date: startDate,
            end_date: endDate,
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(value);
    };

    return (
        <AdminLayout>
            <Head title="Sales Reports" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Sales Reports</h2>
                    <Button onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="period">Period</Label>
                                <Select value={period} onValueChange={setPeriod}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleFilter}>Apply Filter</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-amber-800">{summary.total_orders}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-amber-800">{formatCurrency(summary.total_revenue)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Average Order Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-amber-800">{formatCurrency(summary.average_order_value)}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={salesData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={date => {
                                                if (period === 'yearly') return date;
                                                return format(new Date(date), period === 'monthly' ? 'MMM yyyy' : 'dd MMM');
                                            }}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value: number, name: string) => {
                                                if (name === 'Orders') return value;
                                                return formatCurrency(value);
                                            }}
                                            labelFormatter={date => {
                                                if (period === 'yearly') return `Year ${date}`;
                                                return format(new Date(date), period === 'monthly' ? 'MMMM yyyy' : 'dd MMMM yyyy');
                                            }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="total_sales" name="Sales" stroke="#D97706" />
                                        <Line type="monotone" dataKey="total_orders" name="Orders" stroke="#92400E" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Order Type Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={orderTypes}
                                            dataKey="count"
                                            nameKey="order_type"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={150}
                                            label={({ order_type, count }) => `${order_type} (${count})`}
                                        >
                                            {orderTypes.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Selling Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead className="text-right">Quantity Sold</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topSellingItems.map(item => (
                                    <TableRow key={item.name}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell className="text-right">{item.total_quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
} 