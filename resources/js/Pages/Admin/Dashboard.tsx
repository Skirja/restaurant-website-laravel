import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    ShoppingCart,
    Users,
    CalendarDays,
    DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
    total_orders: number;
    total_customers: number;
    active_reservations: number;
    total_revenue: number;
    recent_orders: Array<{
        id: string;
        user: {
            name: string;
        };
        total_amount: number;
        status: string;
        created_at: string;
    }>;
}

interface Props {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
    stats: Stats;
}

export default function Dashboard({ auth, stats }: Props) {
    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight text-amber-800">Dashboard</h2>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-amber-600">Welcome back, {auth.user.name}</span>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-amber-100 bg-white hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-800">
                                Total Orders
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">{stats.total_orders}</div>
                            <p className="text-xs text-amber-600">
                                +0% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-100 bg-white hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-800">
                                Total Customers
                            </CardTitle>
                            <Users className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">{stats.total_customers}</div>
                            <p className="text-xs text-amber-600">
                                +0% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-100 bg-white hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-800">
                                Active Reservations
                            </CardTitle>
                            <CalendarDays className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">{stats.active_reservations}</div>
                            <p className="text-xs text-amber-600">
                                +0% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-100 bg-white hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-800">
                                Total Revenue
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">
                                Rp {stats.total_revenue.toLocaleString()}
                            </div>
                            <p className="text-xs text-amber-600">
                                +0% from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Orders */}
                <Card className="border-amber-100 bg-white">
                    <CardHeader>
                        <CardTitle className="text-amber-800">Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.recent_orders.length > 0 ? (
                            <div className="space-y-4">
                                {stats.recent_orders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-amber-50 transition-colors">
                                        <div>
                                            <p className="font-medium text-amber-900">{order.user.name}</p>
                                            <p className="text-sm text-amber-600">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-amber-900">
                                                Rp {order.total_amount.toLocaleString()}
                                            </p>
                                            <span className={cn(
                                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                order.status === 'completed' && "bg-green-100 text-green-800",
                                                order.status === 'pending' && "bg-yellow-100 text-yellow-800",
                                                order.status === 'cancelled' && "bg-red-100 text-red-800"
                                            )}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-amber-600">No recent orders found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
} 