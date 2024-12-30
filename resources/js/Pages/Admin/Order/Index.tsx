import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Button } from "@/Components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Eye, MoreHorizontal, Trash } from "lucide-react";
import { Badge } from "@/Components/ui/badge";

interface OrderItem {
    name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface Payment {
    method: string;
    status: string;
}

interface Order {
    id: string;
    customer_name: string;
    order_type: 'dine-in' | 'takeaway' | 'delivery';
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    total_amount: number;
    payment_status: string;
    created_at: string;
    items: OrderItem[];
    payment: Payment | null;
}

interface Props {
    orders: Order[];
}

export default function Index({ orders }: Props) {
    const getStatusColor = (status: Order['status']) => {
        const colors = {
            pending: 'bg-amber-100 text-amber-800',
            processing: 'bg-amber-200 text-amber-800',
            completed: 'bg-amber-300 text-amber-900',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status];
    };

    const getPaymentStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            paid: 'bg-amber-300 text-amber-900',
            pending: 'bg-amber-100 text-amber-800',
            failed: 'bg-red-100 text-red-800',
        };
        return colors[status.toLowerCase()] || 'bg-amber-50 text-amber-700';
    };

    const handleStatusChange = (orderId: string, status: string) => {
        router.put(route('admin.orders.update', orderId), {
            status: status,
        });
    };

    return (
        <AdminLayout>
            <Head title="Order Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
                </div>

                <div className="grid gap-6">
                    <Card className="border border-amber-200">
                        <CardHeader className="bg-amber-50 hover:bg-amber-100">
                            <CardTitle>Orders List</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table className="border border-amber-200">
                                <TableHeader className="bg-amber-50 hover:bg-amber-100">
                                    <TableRow className="bg-amber-50 hover:bg-amber-100">
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="bg-amber-50 hover:bg-amber-100">
                                    {orders.map((order) => (
                                        <TableRow key={order.id} className="bg-amber-50 hover:bg-amber-100">
                                            <TableCell className="font-medium bg-amber-50 hover:bg-amber-100">
                                                {order.id.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell className="bg-amber-50 hover:bg-amber-100">{order.customer_name}</TableCell>
                                            <TableCell className="bg-amber-50 hover:bg-amber-100">
                                                <Badge variant="secondary">
                                                    {order.order_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="bg-amber-50 hover:bg-amber-100">
                                                <Select
                                                    defaultValue={order.status}
                                                    onValueChange={(value) => handleStatusChange(order.id, value)}
                                                >
                                                    <SelectTrigger className="w-[130px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="processing">Processing</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="bg-amber-50 hover:bg-amber-100">Rp {order.total_amount.toLocaleString()}</TableCell>
                                            <TableCell className="bg-amber-50 hover:bg-amber-100">
                                                <Badge
                                                    className={getPaymentStatusColor(order.payment_status)}
                                                >
                                                    {order.payment_status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="bg-amber-50 hover:bg-amber-100">{order.created_at}</TableCell>
                                            <TableCell className="bg-amber-50 hover:bg-amber-100">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                router.get(route('admin.orders.show', order.id))
                                                            }
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {order.status !== 'completed' && (
                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() =>
                                                                    router.delete(route('admin.orders.destroy', order.id))
                                                                }
                                                            >
                                                                <Trash className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
} 