import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
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
import { Plus, MoreHorizontal, Pencil, Trash, ImageIcon } from "lucide-react";

// Function to format number to IDR
const formatToIDR = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    formatted_price?: string;
    category: {
        id: string;
        name: string;
    };
    image_url: string | null;
    stock_quantity: number;
    is_available: boolean;
}

interface Category {
    id: string;
    name: string;
}

interface Props {
    menu_items: MenuItem[];
    categories: Category[];
}

export default function Index({ menu_items, categories }: Props) {
    return (
        <AdminLayout>
            <Head title="Menu Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight text-amber-800">Menu Management</h2>
                    <Button onClick={() => router.get(route('admin.menu.create'))} className="bg-amber-600 hover:bg-amber-700 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Menu Item
                    </Button>
                </div>

                <div className="rounded-md border border-amber-200">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-amber-50 hover:bg-amber-100">
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[70px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {menu_items.map((item) => (
                                <TableRow key={item.id} className="hover:bg-amber-50">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            {item.image_url ? (
                                                <img
                                                    src={`/storage/menu-items/${item.image_url.split('/').pop()}`}
                                                    alt={item.name}
                                                    className="h-10 w-10 rounded-md object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-100">
                                                    <ImageIcon className="h-5 w-5 text-amber-600" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-amber-900">{item.name}</div>
                                                <div className="text-sm text-amber-600">
                                                    {item.description}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-amber-800">{item.category.name}</TableCell>
                                    <TableCell className="text-amber-800">{item.formatted_price || formatToIDR(item.price)}</TableCell>
                                    <TableCell className="text-amber-800">{item.stock_quantity}</TableCell>
                                    <TableCell>
                                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.is_available
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {item.is_available ? 'Available' : 'Unavailable'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-100">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-white border-amber-200">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        router.get(route('admin.menu.edit', item.id))
                                                    }
                                                    className="text-amber-800 hover:bg-amber-50 cursor-pointer"
                                                >
                                                    <Pencil className="mr-2 h-4 w-4 text-amber-600" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600 hover:bg-red-50 cursor-pointer"
                                                    onClick={() =>
                                                        router.delete(route('admin.menu.destroy', item.id))
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
                </div>
            </div>
        </AdminLayout>
    );
} 