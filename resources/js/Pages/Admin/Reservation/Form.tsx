import { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
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
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import debounce from 'lodash/debounce';

interface Table {
    id: string;
    table_number: number;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved';
}

interface Props {
    tables: Table[];
}

export default function Form({ tables }: Props) {
    const [availableTables, setAvailableTables] = useState<Table[]>(tables);
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        table_id: '',
        reservation_date: '',
        reservation_time: '',
        number_of_guests: '',
        special_requests: '',
    });

    const checkAvailability = debounce(async () => {
        if (data.reservation_date && data.reservation_time && data.number_of_guests) {
            try {
                const response = await axios.get(route('admin.reservations.check-availability'), {
                    params: {
                        date: data.reservation_date,
                        time: data.reservation_time,
                        guests: data.number_of_guests,
                    },
                });
                setAvailableTables(response.data.available_tables);
            } catch (error) {
                console.error('Error checking table availability:', error);
            }
        }
    }, 500);

    useEffect(() => {
        checkAvailability();
    }, [data.reservation_date, data.reservation_time, data.number_of_guests]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.reservations.store'));
    };

    return (
        <AdminLayout>
            <Head title="Create Reservation" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.get(route('admin.reservations.index'))}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Reservations
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight">Create Reservation</h2>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Reservation Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="user_id">Customer</Label>
                                    <Input
                                        id="user_id"
                                        value={data.user_id}
                                        onChange={e => setData('user_id', e.target.value)}
                                        placeholder="Enter customer ID"
                                    />
                                    {errors.user_id && (
                                        <p className="text-sm text-red-600">{errors.user_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="number_of_guests">Number of Guests</Label>
                                    <Input
                                        id="number_of_guests"
                                        type="number"
                                        min="1"
                                        value={data.number_of_guests}
                                        onChange={e => setData('number_of_guests', e.target.value)}
                                        placeholder="Enter number of guests"
                                    />
                                    {errors.number_of_guests && (
                                        <p className="text-sm text-red-600">{errors.number_of_guests}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reservation_date">Date</Label>
                                    <Input
                                        id="reservation_date"
                                        type="date"
                                        value={data.reservation_date}
                                        onChange={e => setData('reservation_date', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.reservation_date && (
                                        <p className="text-sm text-red-600">{errors.reservation_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reservation_time">Time</Label>
                                    <Input
                                        id="reservation_time"
                                        type="time"
                                        value={data.reservation_time}
                                        onChange={e => setData('reservation_time', e.target.value)}
                                    />
                                    {errors.reservation_time && (
                                        <p className="text-sm text-red-600">{errors.reservation_time}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="table_id">Table</Label>
                                    <Select
                                        value={data.table_id}
                                        onValueChange={value => setData('table_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a table" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableTables.map(table => (
                                                <SelectItem key={table.id} value={table.id}>
                                                    Table {table.table_number} (Capacity: {table.capacity})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.table_id && (
                                        <p className="text-sm text-red-600">{errors.table_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="special_requests">Special Requests</Label>
                                    <Input
                                        id="special_requests"
                                        value={data.special_requests}
                                        onChange={e => setData('special_requests', e.target.value)}
                                        placeholder="Enter any special requests"
                                    />
                                    {errors.special_requests && (
                                        <p className="text-sm text-red-600">{errors.special_requests}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    className="bg-amber-600 hover:bg-amber-700"
                                    disabled={processing}
                                >
                                    {processing ? 'Creating...' : 'Create Reservation'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
} 