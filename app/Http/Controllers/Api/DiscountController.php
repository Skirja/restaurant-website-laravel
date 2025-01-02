<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use Illuminate\Http\Request;

class DiscountController extends Controller
{
    public function check(Request $request)
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
            return response()->json([
                'valid' => false,
                'message' => 'Kode diskon tidak valid'
            ]);
        }

        return response()->json([
            'valid' => true,
            'discount' => [
                'code' => $discount->code,
                'value' => $discount->value,
                'type' => $discount->type,
            ]
        ]);
    }
} 