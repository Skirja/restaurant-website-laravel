<?php

namespace App\Http\Controllers;

use App\Models\Discount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DiscountController extends Controller
{
    public function validate(Request $request)
    {
        $request->validate([
            'code' => 'required|string'
        ]);

        $discount = Discount::where('code', $request->code)
            ->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();

        if (!$discount) {
            return response()->json(['error' => 'Kode diskon tidak valid'], 422);
        }

        return response()->json([
            'discount' => [
                'value' => $discount->value,
                'type' => $discount->type
            ]
        ]);
    }
}
