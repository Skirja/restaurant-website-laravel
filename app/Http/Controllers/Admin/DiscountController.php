<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DiscountController extends Controller
{
    public function index()
    {
        $discounts = Discount::with('user')
            ->latest()
            ->get()
            ->map(function ($discount) {
                return [
                    'id' => $discount->id,
                    'code' => $discount->code,
                    'description' => $discount->description,
                    'discount_type' => $discount->discount_type,
                    'discount_value' => $discount->discount_value,
                    'start_date' => $discount->start_date->format('Y-m-d'),
                    'end_date' => $discount->end_date->format('Y-m-d'),
                    'is_active' => $discount->is_active,
                    'max_uses' => $discount->max_uses,
                    'created_by' => $discount->user ? $discount->user->name : null,
                    'created_at' => $discount->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Discount/Index', [
            'discounts' => $discounts,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Discount/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', Rule::unique('discounts')],
            'description' => 'nullable|string',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean',
            'max_uses' => 'required|integer|min:1',
        ]);

        $validated['user_id'] = auth()->id();

        Discount::create($validated);

        return redirect()->route('admin.discounts.index')
            ->with('success', 'Discount created successfully.');
    }

    public function edit(Discount $discount)
    {
        return Inertia::render('Admin/Discount/Form', [
            'discount' => [
                'id' => $discount->id,
                'code' => $discount->code,
                'description' => $discount->description,
                'discount_type' => $discount->discount_type,
                'discount_value' => $discount->discount_value,
                'start_date' => $discount->start_date->format('Y-m-d'),
                'end_date' => $discount->end_date->format('Y-m-d'),
                'is_active' => $discount->is_active,
                'max_uses' => $discount->max_uses,
            ],
        ]);
    }

    public function update(Request $request, Discount $discount)
    {
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('discounts', 'code')->ignore($discount)
            ],
            'description' => 'nullable|string',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean',
            'max_uses' => 'required|integer|min:1',
        ]);

        $discount->update($validated);

        return redirect()->route('admin.discounts.index')
            ->with('success', 'Discount updated successfully.');
    }

    public function destroy(Discount $discount)
    {
        $discount->delete();

        return redirect()->route('admin.discounts.index')
            ->with('success', 'Discount deleted successfully.');
    }
}
