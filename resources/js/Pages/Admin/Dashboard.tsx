import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    ShoppingCart,
    Users,
    CalendarDays,
    DollarSign
} from "lucide-react";

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
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Orders
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_orders}</div>
                            <p className="text-xs text-muted-foreground">
                                +0% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Customers
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_customers}</div>
                            <p className="text-xs text-muted-foreground">
                                +0% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Reservations
                            </CardTitle>
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_reservations}</div>
                            <p className="text-xs text-muted-foreground">
                                +0% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Revenue
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.total_revenue}</div>
                            <p className="text-xs text-muted-foreground">
                                +0% from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.recent_orders.length > 0 ? (
                            <div className="space-y-4">
                                {stats.recent_orders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{order.user.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-medium">${order.total_amount}</p>
                                            <p className="text-sm text-muted-foreground">{order.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No recent orders found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
} 