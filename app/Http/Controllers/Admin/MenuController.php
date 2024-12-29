<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class MenuController extends Controller
{
    public function index()
    {
        $menu_items = MenuItem::with('category')->latest()->get()->map(function ($item) {
            return [
                ...$item->toArray(),
                'formatted_price' => $item->formatted_price,
                'image_url' => $item->image_url
            ];
        });
        
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
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'category_id' => 'required|exists:categories,id',
                'image_url' => 'nullable|image|max:2048',
                'stock_quantity' => 'required|integer|min:0',
                'is_available' => 'required|boolean',
            ]);

            // Clean up price value
            $validated['price'] = (float) preg_replace('/[^0-9.]/', '', $validated['price']);

            if ($request->hasFile('image_url')) {
                $path = $request->file('image_url')->store('menu-items', 'public');
                $validated['image_url'] = $path;
            }

            MenuItem::create($validated);

            return redirect()->route('admin.menu.index')
                ->with('success', 'Menu item created successfully.');
        } catch (\Exception $e) {
            Log::error('Error creating menu item: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Failed to create menu item. Please try again.'])
                ->withInput();
        }
    }

    public function edit(MenuItem $menu)
    {
        $menu->price = (float)$menu->price;
        $categories = Category::all();

        // Prepare menu item data with proper image URL
        $menuData = $menu->toArray();
        if ($menu->image_url) {
            $menuData['image_url'] = Storage::url($menu->image_url);
        }

        return Inertia::render('Admin/Menu/Form', [
            'menu_item' => $menuData,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, MenuItem $menu)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'category_id' => 'required|exists:categories,id',
                'image_url' => 'nullable|image|max:2048',
                'stock_quantity' => 'required|integer|min:0',
                'is_available' => 'required|boolean',
            ]);

            // Clean up price value
            $validated['price'] = (float) preg_replace('/[^0-9.]/', '', $validated['price']);

            if ($request->hasFile('image_url')) {
                // Delete old image if exists
                if ($menu->image_url && Storage::disk('public')->exists($menu->image_url)) {
                    Storage::disk('public')->delete($menu->image_url);
                }

                $path = $request->file('image_url')->store('menu-items', 'public');
                $validated['image_url'] = $path;
            }

            $menu->update($validated);

            return redirect()->route('admin.menu.index')
                ->with('success', 'Menu item updated successfully.');
        } catch (\Exception $e) {
            Log::error('Error updating menu item: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Failed to update menu item. Please try again.'])
                ->withInput();
        }
    }

    public function destroy(MenuItem $menu)
    {
        try {
            // Delete image if exists
            if ($menu->image_url && Storage::disk('public')->exists($menu->image_url)) {
                Storage::disk('public')->delete($menu->image_url);
            }

            $menu->delete();

            return redirect()->route('admin.menu.index')
                ->with('success', 'Menu item deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Error deleting menu item: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Failed to delete menu item. Please try again.']);
        }
    }
}
