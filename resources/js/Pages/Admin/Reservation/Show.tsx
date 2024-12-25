import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Trash } from "lucide-react";

interface Customer {
    name: string;
    email: string;
    phone: string;
}

interface Table {
    number: number;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved';
}

interface Reservation {
    id: string;
    customer: Customer;
    table: Table;
    date: string;
    time: string;
    guests: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    special_requests: string | null;
    created_at: string;
}

interface Props {
    reservation: Reservation;
}

export default function Show({ reservation }: Props) {
    const handleStatusChange = (status: string) => {
        router.put(route('admin.reservations.update', reservation.id), {
            status: status
        });
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout>
            <Head title="Reservation Details" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.get(route('admin.reservations.index'))}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Reservations
                        </Button>
                        <h2 className="text-3xl font-bold tracking-tight">Reservation Details</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {reservation.status === 'pending' && (
                            <>
                                <Button
                                    variant="outline"
                                    className="text-green-600"
                                    onClick={() => handleStatusChange('confirmed')}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Confirm Reservation
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-red-600"
                                    onClick={() => handleStatusChange('cancelled')}
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel Reservation
                                </Button>
                            </>
                        )}
                        {reservation.status !== 'confirmed' && (
                            <Button
                                variant="destructive"
                                onClick={() =>
                                    router.delete(route('admin.reservations.destroy', reservation.id))
                                }
                            >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete Reservation
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Name</p>
                                <p className="text-lg">{reservation.customer.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="text-lg">{reservation.customer.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Phone</p>
                                <p className="text-lg">{reservation.customer.phone}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Reservation Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Status</p>
                                <Badge className={getStatusBadgeColor(reservation.status)}>
                                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Table</p>
                                <p className="text-lg">
                                    Table {reservation.table.number} (Capacity: {reservation.table.capacity} guests)
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Date & Time</p>
                                <p className="text-lg">{reservation.date} at {reservation.time}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Number of Guests</p>
                                <p className="text-lg">{reservation.guests} guests</p>
                            </div>
                            {reservation.special_requests && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Special Requests</p>
                                    <p className="text-lg">{reservation.special_requests}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium text-gray-500">Created At</p>
                                <p className="text-lg">{reservation.created_at}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
} 