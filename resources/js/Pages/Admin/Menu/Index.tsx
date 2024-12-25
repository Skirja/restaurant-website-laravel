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
import { Plus, MoreHorizontal, Pencil, Trash } from "lucide-react";

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: {
        id: string;
        name: string;
    };
    image_url: string;
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
                    <h2 className="text-3xl font-bold tracking-tight">Menu Management</h2>
                    <Button onClick={() => router.get(route('admin.menu.create'))}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Menu Item
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
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
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            {item.image_url && (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="h-10 w-10 rounded-md object-cover"
                                                />
                                            )}
                                            <div>
                                                <div>{item.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {item.description}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.category.name}</TableCell>
                                    <TableCell>${item.price}</TableCell>
                                    <TableCell>{item.stock_quantity}</TableCell>
                                    <TableCell>
                                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            item.is_available
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {item.is_available ? 'Available' : 'Unavailable'}
                                        </div>
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
                                                        router.get(route('admin.menu.edit', item.id))
                                                    }
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600"
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