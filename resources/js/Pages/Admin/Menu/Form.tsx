import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm as useInertiaForm, router } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import {
    Form as FormRoot,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/Components/ui/form";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Switch } from "@/Components/ui/switch";
import { Label } from "@/Components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Function to format number to IDR
const formatToIDR = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

// Function to parse IDR string to number
const parseFromIDR = (value: string): number => {
    // Remove currency symbol, dots, and other non-numeric characters
    return parseInt(value.replace(/[^0-9]/g, ''));
};

interface Category {
    id: string;
    name: string;
}

interface MenuItem {
    id?: string;
    name: string;
    description: string;
    price: number;
    category_id: string;
    image_url?: string | File;
    stock_quantity: number;
    is_available: boolean;
}

interface Props {
    categories: Category[];
    menu_item?: MenuItem;
}

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.string().min(1, "Price is required"),
    category_id: z.string().min(1, "Category is required"),
    image_url: z.any().optional(),
    stock_quantity: z.number().min(0, "Stock quantity must be positive"),
    is_available: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

export default function Form({ categories, menu_item }: Props) {
    const { processing } = useInertiaForm<FormData>();
    const [imagePreview, setImagePreview] = useState<string | null>(menu_item?.image_url as string || null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: menu_item?.name || '',
            description: menu_item?.description || '',
            price: menu_item ? formatToIDR(menu_item.price) : 'Rp 0',
            category_id: menu_item?.category_id || '',
            image_url: undefined,
            stock_quantity: menu_item?.stock_quantity || 0,
            is_available: menu_item?.is_available ?? true,
        },
    });

    const onSubmit = (values: FormData) => {
        const formData = new FormData();

        // Add all form fields to FormData
        formData.append('name', values.name);
        formData.append('description', values.description);
        // Parse price from IDR format to number before sending
        formData.append('price', parseFromIDR(values.price).toString());
        formData.append('category_id', values.category_id);
        formData.append('stock_quantity', values.stock_quantity.toString());
        formData.append('is_available', values.is_available ? '1' : '0');

        // Add image if it exists
        if (values.image_url instanceof File) {
            formData.append('image_url', values.image_url);
        }

        if (menu_item?.id) {
            router.post(route('admin.menu.update', menu_item.id), {
                _method: 'PUT',
                ...Object.fromEntries(formData),
            }, {
                forceFormData: true,
            });
        } else {
            router.post(route('admin.menu.store'), formData);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue('image_url', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AdminLayout>
            <Head title={menu_item ? 'Edit Menu Item' : 'Add Menu Item'} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight text-amber-800">
                        {menu_item ? 'Edit Menu Item' : 'Add Menu Item'}
                    </h2>
                </div>

                <div className="rounded-md border border-amber-200 bg-white p-6">
                    <FormRoot {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-amber-800">Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter menu item name"
                                                        {...field}
                                                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-amber-800">Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Enter menu item description"
                                                        {...field}
                                                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="category_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-amber-800">Category</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="border-amber-200 focus:border-amber-400 focus:ring-amber-400">
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem
                                                                key={category.id}
                                                                value={category.id}
                                                                className="hover:bg-amber-50 focus:bg-amber-50"
                                                            >
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-amber-800">Price (IDR)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter price in Rupiah"
                                                        {...field}
                                                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="stock_quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-amber-800">Stock Quantity</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="Enter stock quantity"
                                                        {...field}
                                                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="image_url"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-amber-800">Image</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                                                    />
                                                </FormControl>
                                                {imagePreview && (
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="mt-2 h-32 w-32 rounded-md object-cover border border-amber-200"
                                                    />
                                                )}
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="is_available"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="data-[state=checked]:bg-amber-600"
                                                    />
                                                </FormControl>
                                                <Label className="text-amber-800">Available</Label>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-amber-600 hover:bg-amber-700 text-white"
                                >
                                    {menu_item ? 'Update Menu Item' : 'Create Menu Item'}
                                </Button>
                            </div>
                        </form>
                    </FormRoot>
                </div>
            </div>
        </AdminLayout>
    );
} 