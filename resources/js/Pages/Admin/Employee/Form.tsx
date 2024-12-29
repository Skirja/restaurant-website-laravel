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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { ArrowLeft } from 'lucide-react';

interface Employee {
    id?: string;
    name: string;
    email: string;
    position: string;
    department: string;
    hire_date: string;
    out_date?: string;
    status: 'active' | 'inactive' | 'terminated';
}

interface Props {
    employee?: Employee;
}

export default function Form({ employee }: Props) {
    const { data, setData, post, put, processing, errors } = useForm<Employee>({
        name: employee?.name || '',
        email: employee?.email || '',
        position: employee?.position || '',
        department: employee?.department || '',
        hire_date: employee?.hire_date || '',
        out_date: employee?.out_date || '',
        status: employee?.status || 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (employee?.id) {
            put(route('admin.employees.update', employee.id));
        } else {
            post(route('admin.employees.store'));
        }
    };

    return (
        <AdminLayout>
            <Head title={`${employee ? 'Edit' : 'Create'} Employee`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {employee ? 'Edit' : 'Create'} Employee
                    </h2>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Employee Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="Enter employee name"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="Enter employee email"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="position">Position</Label>
                                    <Input
                                        id="position"
                                        value={data.position}
                                        onChange={e => setData('position', e.target.value)}
                                        placeholder="Enter employee position"
                                    />
                                    {errors.position && (
                                        <p className="text-sm text-red-600">{errors.position}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Input
                                        id="department"
                                        value={data.department}
                                        onChange={e => setData('department', e.target.value)}
                                        placeholder="Enter employee department"
                                    />
                                    {errors.department && (
                                        <p className="text-sm text-red-600">{errors.department}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hire_date">Hire Date</Label>
                                    <Input
                                        id="hire_date"
                                        type="date"
                                        value={data.hire_date}
                                        onChange={e => setData('hire_date', e.target.value)}
                                    />
                                    {errors.hire_date && (
                                        <p className="text-sm text-red-600">{errors.hire_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="out_date">Out Date</Label>
                                    <Input
                                        id="out_date"
                                        type="date"
                                        value={data.out_date}
                                        onChange={e => setData('out_date', e.target.value)}
                                    />
                                    {errors.out_date && (
                                        <p className="text-sm text-red-600">{errors.out_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value: 'active' | 'inactive' | 'terminated') => setData('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select employee status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="terminated">Terminated</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing ? 'Saving...' : (employee ? 'Update' : 'Create')} Employee
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
} 