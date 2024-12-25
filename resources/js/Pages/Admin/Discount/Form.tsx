import { useEffect } from 'react';
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
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Switch } from "@/Components/ui/switch";
import { ArrowLeft } from 'lucide-react';

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
}

interface Props {
    discount?: Discount;
}

export default function Form({ discount }: Props) {
    const { data, setData, post, put, processing, errors } = useForm<Discount>({
        code: discount?.code || '',
        description: discount?.description || '',
        discount_type: discount?.discount_type || 'fixed',
        discount_value: discount?.discount_value || 0,
        start_date: discount?.start_date || '',
        end_date: discount?.end_date || '',
        is_active: discount?.is_active ?? true,
        max_uses: discount?.max_uses || 1,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (discount?.id) {
            put(route('admin.discounts.update', discount.id));
        } else {
            post(route('admin.discounts.store'));
        }
    };

    return (
        <AdminLayout>
            <Head title={`${discount ? 'Edit' : 'Create'} Discount`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.get(route('admin.discounts.index'))}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Discounts
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {discount ? 'Edit' : 'Create'} Discount
                    </h2>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Discount Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Discount Code</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={e => setData('code', e.target.value)}
                                        placeholder="Enter discount code"
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-red-600">{errors.code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="discount_type">Discount Type</Label>
                                    <Select
                                        value={data.discount_type}
                                        onValueChange={(value: 'percentage' | 'fixed') => setData('discount_type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select discount type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.discount_type && (
                                        <p className="text-sm text-red-600">{errors.discount_type}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="discount_value">
                                        {data.discount_type === 'percentage' ? 'Percentage' : 'Amount'}
                                    </Label>
                                    <Input
                                        id="discount_value"
                                        type="number"
                                        value={data.discount_value}
                                        onChange={e => setData('discount_value', Number(e.target.value))}
                                        placeholder={data.discount_type === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                                        min={0}
                                        max={data.discount_type === 'percentage' ? 100 : undefined}
                                    />
                                    {errors.discount_value && (
                                        <p className="text-sm text-red-600">{errors.discount_value}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="max_uses">Maximum Uses</Label>
                                    <Input
                                        id="max_uses"
                                        type="number"
                                        value={data.max_uses}
                                        onChange={e => setData('max_uses', Number(e.target.value))}
                                        placeholder="Enter maximum uses"
                                        min={1}
                                    />
                                    {errors.max_uses && (
                                        <p className="text-sm text-red-600">{errors.max_uses}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={e => setData('start_date', e.target.value)}
                                    />
                                    {errors.start_date && (
                                        <p className="text-sm text-red-600">{errors.start_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End Date</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={e => setData('end_date', e.target.value)}
                                    />
                                    {errors.end_date && (
                                        <p className="text-sm text-red-600">{errors.end_date}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description || ''}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Enter discount description"
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={checked => setData('is_active', checked)}
                                />
                                <Label htmlFor="is_active">Active</Label>
                                {errors.is_active && (
                                    <p className="text-sm text-red-600">{errors.is_active}</p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    className="bg-amber-600 hover:bg-amber-700"
                                    disabled={processing}
                                >
                                    {processing ? 'Saving...' : (discount ? 'Update' : 'Create')} Discount
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
} 