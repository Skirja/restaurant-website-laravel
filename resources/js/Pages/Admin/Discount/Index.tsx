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
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

interface Discount {
    id: string;
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    max_uses: number;
    created_by: string | null;
    created_at: string;
}

interface Props {
    discounts: Discount[];
}

export default function Index({ discounts }: Props) {
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const filteredDiscounts = discounts.filter(discount => {
        if (filter === 'active') return discount.is_active;
        if (filter === 'inactive') return !discount.is_active;
        return true;
    });

    const formatValue = (type: 'percentage' | 'fixed', value: number) => {
        if (type === 'percentage') {
            return `${value}%`;
        }
        return `Rp ${value.toLocaleString()}`;
    };

    return (
        <AdminLayout>
            <Head title="Discount Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Discount Management</h2>
                    <div className="flex items-center gap-4">
                        <Select
                            value={filter}
                            onValueChange={(value: 'all' | 'active' | 'inactive') => setFilter(value)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter discounts" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Discounts</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={() => router.get(route('admin.discounts.create'))}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Discount
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Discounts List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Validity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Max Uses</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDiscounts.map((discount) => (
                                    <TableRow key={discount.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{discount.code}</p>
                                                {discount.description && (
                                                    <p className="text-sm text-amber-700">{discount.description}</p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize text-amber-800">{discount.discount_type}</TableCell>
                                        <TableCell className="text-amber-800">
                                            {formatValue(discount.discount_type, discount.discount_value)}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm text-amber-700">From: {discount.start_date}</p>
                                                <p className="text-sm text-amber-700">To: {discount.end_date}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={discount.is_active ? 'bg-amber-100 text-amber-800' : 'bg-amber-50 text-amber-700'}
                                            >
                                                {discount.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{discount.max_uses}</TableCell>
                                        <TableCell>{discount.created_by || 'System'}</TableCell>
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
                                                            router.get(route('admin.discounts.edit', discount.id))
                                                        }
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() =>
                                                            router.delete(route('admin.discounts.destroy', discount.id))
                                                        }
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
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