<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index()
    {
        $menu_items = MenuItem::with('category')->latest()->get();
        $categories = Category::all();

        return Inertia::render('Admin/Menu/Index', [
            'menu_items' => $menu_items,
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        $categories = Category::all();

        return Inertia::render('Admin/Menu/Form', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'image_url' => 'nullable|image|max:2048',
            'stock_quantity' => 'required|integer|min:0',
            'is_available' => 'boolean',
        ]);

        if ($request->hasFile('image_url')) {
            $path = $request->file('image_url')->store('menu-items', 'public');
            $validated['image_url'] = Storage::url($path);
        }

        MenuItem::create($validated);

        return redirect()->route('admin.menu.index')
            ->with('success', 'Menu item created successfully.');
    }

    public function edit(MenuItem $menu)
    {
        $categories = Category::all();

        return Inertia::render('Admin/Menu/Form', [
            'menu_item' => $menu,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, MenuItem $menu)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'image_url' => 'nullable|image|max:2048',
            'stock_quantity' => 'required|integer|min:0',
            'is_available' => 'boolean',
        ]);

        if ($request->hasFile('image_url')) {
            // Delete old image
            if ($menu->image_url) {
                Storage::delete(str_replace('/storage', 'public', $menu->image_url));
            }

            $path = $request->file('image_url')->store('menu-items', 'public');
            $validated['image_url'] = Storage::url($path);
        }

        $menu->update($validated);

        return redirect()->route('admin.menu.index')
            ->with('success', 'Menu item updated successfully.');
    }

    public function destroy(MenuItem $menu)
    {
        if ($menu->image_url) {
            Storage::delete(str_replace('/storage', 'public', $menu->image_url));
        }

        $menu->delete();

        return redirect()->route('admin.menu.index')
            ->with('success', 'Menu item deleted successfully.');
    }
}
