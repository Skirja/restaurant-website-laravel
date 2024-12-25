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
}

interface Review {
    id: string;
    customer: Customer;
    content: string;
    rating: number;
    is_published: boolean;
    created_at: string;
}

interface Props {
    reviews: Review[];
}

export default function Index({ reviews }: Props) {
    const [filter, setFilter] = useState<'all' | 'published' | 'unpublished'>('all');

    const filteredReviews = reviews.filter(review => {
        if (filter === 'published') return review.is_published;
        if (filter === 'unpublished') return !review.is_published;
        return true;
    });

    const handlePublishToggle = (reviewId: string, isPublished: boolean) => {
        router.put(route('admin.reviews.update', reviewId), {
            is_published: isPublished
        });
    };

    const renderStars = (rating: number) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    return (
        <AdminLayout>
            <Head title="Review Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Review Management</h2>
                    <Select
                        value={filter}
                        onValueChange={(value: 'all' | 'published' | 'unpublished') => setFilter(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter reviews" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Reviews</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="unpublished">Unpublished</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Reviews List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Review</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReviews.map((review) => (
                                    <TableRow key={review.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{review.customer.name}</p>
                                                <p className="text-sm text-gray-500">{review.customer.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-amber-500">{renderStars(review.rating)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <p className="line-clamp-2">{review.content}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={review.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                                            >
                                                {review.is_published ? 'Published' : 'Unpublished'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{review.created_at}</TableCell>
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
                                                            router.get(route('admin.reviews.show', review.id))
                                                        }
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    {review.is_published ? (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handlePublishToggle(review.id, false)
                                                            }
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Unpublish
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handlePublishToggle(review.id, true)
                                                            }
                                                        >
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Publish
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() =>
                                                            router.delete(route('admin.reviews.destroy', review.id))
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