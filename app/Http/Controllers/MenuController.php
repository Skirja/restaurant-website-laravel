<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index()
    {
        $menu_items = MenuItem::with('category')
            ->where('is_available', true)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'category' => $item->category->name,
                    'price' => $item->price,
                    'image' => $item->image_url ? '/storage/' . $item->image_url : null,
                    'description' => $item->description,
                ];
            });

        return Inertia::render('Menu', [
            'menuItems' => $menu_items
        ]);
    }
}
