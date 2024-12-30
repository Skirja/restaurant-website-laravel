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
import { Badge } from "@/Components/ui/badge";
import { Eye, MoreHorizontal, Trash, CheckCircle, XCircle } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

interface Customer {
    name: string;
    email: string;
    phone: string;
}

interface Reservation {
    id: string;
    customer: Customer;
    table_number: number;
    date: string;
    time: string;
    guests: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    special_requests: string | null;
    created_at: string;
}

interface Table {
    id: string;
    number: number;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved';
}

interface Props {
    reservations: Reservation[];
    tables: Table[];
}

export default function Index({ reservations, tables }: Props) {
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

    const filteredReservations = reservations.filter(reservation => {
        if (filter === 'pending') return reservation.status === 'pending';
        if (filter === 'confirmed') return reservation.status === 'confirmed';
        if (filter === 'cancelled') return reservation.status === 'cancelled';
        return true;
    });

    const handleStatusChange = (reservationId: string, status: string) => {
        router.put(route('admin.reservations.update', reservationId), {
            status: status
        });
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-100 text-amber-800';
            case 'confirmed':
                return 'bg-amber-200 text-amber-900';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-amber-50 text-amber-700';
        }
    };

    return (
        <AdminLayout>
            <Head title="Reservation Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Reservation Management</h2>
                    <Select
                        value={filter}
                        onValueChange={(value: 'all' | 'pending' | 'confirmed' | 'cancelled') => setFilter(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter reservations" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Reservations</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Reservations List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Table</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Guests</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReservations.map((reservation) => (
                                    <TableRow key={reservation.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{reservation.customer.name}</p>
                                                <p className="text-sm text-amber-700">{reservation.customer.phone}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-amber-800">Table {reservation.table_number}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-amber-800">{reservation.date}</p>
                                                <p className="text-sm text-amber-700">{reservation.time}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-amber-800">{reservation.guests} guests</TableCell>
                                        <TableCell>
                                            <Badge
                                                className={getStatusBadgeColor(reservation.status)}
                                            >
                                                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            router.get(route('admin.reservations.show', reservation.id))
                                                        }
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    {reservation.status === 'pending' && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleStatusChange(reservation.id, 'confirmed')
                                                                }
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Confirm
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleStatusChange(reservation.id, 'cancelled')
                                                                }
                                                            >
                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                Cancel
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {reservation.status !== 'confirmed' && (
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() =>
                                                                router.delete(route('admin.reservations.destroy', reservation.id))
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
        </AdminLayout>
    );
} 