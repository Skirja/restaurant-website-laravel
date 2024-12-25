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
    review: Review;
}

export default function Show({ review }: Props) {
    const handlePublishToggle = (isPublished: boolean) => {
        router.put(route('admin.reviews.update', review.id), {
            is_published: isPublished
        });
    };

    const renderStars = (rating: number) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    return (
        <AdminLayout>
            <Head title="Review Details" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.get(route('admin.reviews.index'))}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Reviews
                        </Button>
                        <h2 className="text-3xl font-bold tracking-tight">Review Details</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {review.is_published ? (
                            <Button
                                variant="outline"
                                className="text-red-600"
                                onClick={() => handlePublishToggle(false)}
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Unpublish Review
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className="text-green-600"
                                onClick={() => handlePublishToggle(true)}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Publish Review
                            </Button>
                        )}
                        <Button
                            variant="destructive"
                            onClick={() =>
                                router.delete(route('admin.reviews.destroy', review.id))
                            }
                        >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete Review
                        </Button>
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
                                <p className="text-lg">{review.customer.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="text-lg">{review.customer.email}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Review Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Status</p>
                                <Badge
                                    className={review.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                                >
                                    {review.is_published ? 'Published' : 'Unpublished'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Rating</p>
                                <p className="text-lg text-amber-500">{renderStars(review.rating)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Review Content</p>
                                <p className="text-lg whitespace-pre-wrap">{review.content}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Created At</p>
                                <p className="text-lg">{review.created_at}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
} 