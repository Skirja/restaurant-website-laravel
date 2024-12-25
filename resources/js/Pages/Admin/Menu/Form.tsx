import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
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
    image_url?: string;
    stock_quantity: number;
    is_available: boolean;
}

interface Props {
    categories: Category[];
    menu_item?: MenuItem;
}

export default function Form({ categories, menu_item }: Props) {
    const { data, setData, post, put, processing, errors } = useForm<MenuItem>({
        name: menu_item?.name || '',
        description: menu_item?.description || '',
        price: menu_item?.price || 0,
        category_id: menu_item?.category_id || '',
        image_url: menu_item?.image_url || '',
        stock_quantity: menu_item?.stock_quantity || 0,
        is_available: menu_item?.is_available ?? true,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(menu_item?.image_url || null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (menu_item?.id) {
            put(route('admin.menu.update', menu_item.id));
        } else {
            post(route('admin.menu.store'));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image_url', file as any);
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
                    <h2 className="text-3xl font-bold tracking-tight">
                        {menu_item ? 'Edit Menu Item' : 'Add Menu Item'}
                    </h2>
                </div>

                <div className="rounded-md border p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <FormField
                                    name="name"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    value={data.name}
                                                    onChange={e => setData('name', e.target.value)}
                                                    placeholder="Enter menu item name"
                                                />
                                            </FormControl>
                                            {errors.name && <FormMessage>{errors.name}</FormMessage>}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    name="description"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    value={data.description}
                                                    onChange={e => setData('description', e.target.value)}
                                                    placeholder="Enter menu item description"
                                                />
                                            </FormControl>
                                            {errors.description && <FormMessage>{errors.description}</FormMessage>}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    name="category_id"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select
                                                value={data.category_id}
                                                onValueChange={value => setData('category_id', value)}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.category_id && <FormMessage>{errors.category_id}</FormMessage>}
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <FormField
                                    name="price"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Price</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={data.price}
                                                    onChange={e => setData('price', parseFloat(e.target.value))}
                                                    placeholder="Enter price"
                                                />
                                            </FormControl>
                                            {errors.price && <FormMessage>{errors.price}</FormMessage>}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    name="stock_quantity"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Stock Quantity</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    value={data.stock_quantity}
                                                    onChange={e => setData('stock_quantity', parseInt(e.target.value))}
                                                    placeholder="Enter stock quantity"
                                                />
                                            </FormControl>
                                            {errors.stock_quantity && <FormMessage>{errors.stock_quantity}</FormMessage>}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    name="image"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Image</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </FormControl>
                                            {imagePreview && (
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="mt-2 h-32 w-32 rounded-md object-cover"
                                                />
                                            )}
                                            {errors.image_url && <FormMessage>{errors.image_url}</FormMessage>}
                                        </FormItem>
                                    )}
                                />

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_available"
                                        checked={data.is_available}
                                        onCheckedChange={checked => setData('is_available', checked)}
                                    />
                                    <Label htmlFor="is_available">Available</Label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={processing}
                            >
                                {menu_item ? 'Update Menu Item' : 'Create Menu Item'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
} 