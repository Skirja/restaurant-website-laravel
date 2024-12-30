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
import { Badge } from "@/Components/ui/badge";
import { ArrowLeft } from 'lucide-react';

interface OrderItem {
    name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface Payment {
    method: string;
    transaction_id: string;
    status: string;
    amount: number;
}

interface Customer {
    name: string;
    email: string;
    phone: string;
}

interface Order {
    id: string;
    customer: Customer;
    order_type: 'dine-in' | 'takeaway' | 'delivery';
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    total_amount: number;
    discount_amount: number;
    payment_status: string;
    delivery_address?: string;
    estimated_delivery_time?: string;
    created_at: string;
    items: OrderItem[];
    payment: Payment | null;
}

interface Props {
    order: Order;
}

export default function Show({ order }: Props) {
    const handleStatusChange = (status: string) => {
        router.put(route('admin.orders.update', order.id), {
            status: status,
            payment_status: order.payment_status,
            estimated_delivery_time: order.estimated_delivery_time,
        });
    };

    return (
        <AdminLayout>
            <Head title={`Order Details #${order.id.slice(0, 8)}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.get(route('admin.orders.index'))}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Orders
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight text-amber-800">
                        Order Details #{order.id.slice(0, 8)}
                    </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-amber-700">Order Type</p>
                                    <p className="font-medium text-amber-900">{order.order_type}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-amber-700">Status</p>
                                    <Select
                                        defaultValue={order.status}
                                        onValueChange={handleStatusChange}
                                    >
                                        <SelectTrigger className="w-[200px] border-amber-200 focus:border-amber-400 focus:ring-amber-400">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <p className="text-sm text-amber-700">Created At</p>
                                    <p className="font-medium text-amber-900">{order.created_at}</p>
                                </div>
                                {order.estimated_delivery_time && (
                                    <div>
                                        <p className="text-sm text-amber-700">Estimated Delivery</p>
                                        <p className="font-medium text-amber-900">{order.estimated_delivery_time}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-amber-700">Name</p>
                                <p className="font-medium text-amber-900">{order.customer.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-amber-700">Email</p>
                                <p className="font-medium text-amber-900">{order.customer.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-amber-700">Phone</p>
                                <p className="font-medium text-amber-900">{order.customer.phone}</p>
                            </div>
                            {order.delivery_address && (
                                <div>
                                    <p className="text-sm text-amber-700">Delivery Address</p>
                                    <p className="font-medium text-amber-900">{order.delivery_address}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Unit Price</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">
                                                Rp {item.unit_price.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                Rp {item.subtotal.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {order.discount_amount > 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-right font-medium">
                                                Discount
                                            </TableCell>
                                            <TableCell className="text-right text-red-600">
                                                - Rp {order.discount_amount.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-right font-medium">
                                            Total
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            Rp {order.total_amount.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {order.payment && (
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Payment Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-amber-700">Payment Method</p>
                                        <p className="font-medium text-amber-900">{order.payment.method}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-amber-700">Transaction ID</p>
                                        <p className="font-medium text-amber-900">{order.payment.transaction_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-amber-700">Status</p>
                                        <Badge
                                            className={order.payment.status === 'paid' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}
                                        >
                                            {order.payment.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-amber-700">Amount</p>
                                        <p className="font-medium text-amber-900">
                                            Rp {order.payment.amount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
} 