<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index()
    {
        $reviews = Review::with('user')
            ->latest()
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'customer' => [
                        'name' => $review->user->name,
                        'email' => $review->user->email,
                    ],
                    'content' => $review->content,
                    'rating' => $review->rating,
                    'is_published' => $review->is_published,
                    'created_at' => $review->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Review/Index', [
            'reviews' => $reviews,
        ]);
    }

    public function show(Review $review)
    {
        $review->load('user');

        return Inertia::render('Admin/Review/Show', [
            'review' => [
                'id' => $review->id,
                'customer' => [
                    'name' => $review->user->name,
                    'email' => $review->user->email,
                ],
                'content' => $review->content,
                'rating' => $review->rating,
                'is_published' => $review->is_published,
                'created_at' => $review->created_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    public function update(Request $request, Review $review)
    {
        $validated = $request->validate([
            'is_published' => 'required|boolean',
        ]);

        $review->update($validated);

        return redirect()->back()->with('success', 'Review status updated successfully.');
    }

    public function destroy(Review $review)
    {
        $review->delete();

        return redirect()->route('admin.reviews.index')
            ->with('success', 'Review deleted successfully.');
    }
}
