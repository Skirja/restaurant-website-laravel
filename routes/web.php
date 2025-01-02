<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MenuController as AdminMenuController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ReservationController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\DiscountController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\PublicReservationController;
use App\Http\Controllers\TakeawayController;
use App\Models\MenuItem;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Home route for role-based redirection
Route::get('/home', [HomeController::class, 'index'])->name('home');

// Public menu route
Route::get('/menu', [MenuController::class, 'index'])->name('menu');

// Booking routes
Route::middleware(['auth'])->group(function () {
    Route::get('/booking-dinein', [PublicReservationController::class, 'create'])->name('reservations.create');
    Route::post('/reservations', [PublicReservationController::class, 'store'])->name('reservations.store');
    Route::post('/reservations/check', [PublicReservationController::class, 'checkAvailability'])->name('reservations.check');
    Route::post('/reservations/finish', [PublicReservationController::class, 'handlePaymentFinish'])->name('reservations.finish');
    Route::get('/reservations/error', [PublicReservationController::class, 'handlePaymentError'])->name('reservations.error');
    Route::get('/reservations/cancel', [PublicReservationController::class, 'handlePaymentCancel'])->name('reservations.cancel');
});

Route::get('/menu-selection/{type?}', function ($type = 'takeaway') {
    $menu_items = MenuItem::with('category')
        ->where('is_available', true)
        ->get()
        ->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'description' => $item->description,
                'price' => $item->price,
                'category' => [
                    'id' => $item->category->id,
                    'name' => $item->category->name,
                ],
                'image_url' => $item->image_url,
                'stock_quantity' => $item->stock_quantity,
                'is_available' => $item->is_available,
            ];
        });

    return Inertia::render('MenuSelection', [
        'orderType' => $type,
        'menu_items' => $menu_items,
    ]);
})->name('menu-selection');

// Takeaway routes
Route::middleware(['auth'])->group(function () {
    Route::get('/takeaway-checkout', [TakeawayController::class, 'create'])->name('takeaway-checkout');
    Route::post('/takeaway/checkout', [TakeawayController::class, 'checkout'])->name('takeaway.checkout');
    Route::post('/takeaway/finish', [TakeawayController::class, 'handlePaymentFinish'])->name('takeaway.finish');
    Route::get('/takeaway/error', [TakeawayController::class, 'handlePaymentError'])->name('takeaway.error');
    Route::get('/takeaway/cancel', [TakeawayController::class, 'handlePaymentCancel'])->name('takeaway.cancel');
});

Route::post('/takeaway/callback', [TakeawayController::class, 'handlePaymentCallback'])->name('takeaway.callback');

Route::get('/delivery-checkout', function () {
    return Inertia::render('DeliveryCheckout');
})->name('delivery-checkout');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Admin Routes
    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Menu Management
        Route::resource('menu', AdminMenuController::class);

        // Order Management
        Route::resource('orders', OrderController::class);

        // Reservation Management
        Route::resource('reservations', ReservationController::class);
        Route::put('reservations/{reservation}/status', [ReservationController::class, 'updateStatus'])->name('reservations.update-status');
        Route::get('reservations/check-availability', [ReservationController::class, 'checkAvailability'])->name('reservations.check-availability');

        // Review Management
        Route::resource('reviews', ReviewController::class);

        // Discount Management
        Route::resource('discounts', DiscountController::class);

        // Employee Management
        Route::resource('employees', EmployeeController::class);

        // Sales Reports
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
    });
});

// Midtrans callback routes (no auth required)
Route::post('/api/midtrans/callback', [PublicReservationController::class, 'handlePaymentCallback'])->name('midtrans.callback');

// Midtrans Callback Routes
Route::post('reservations/callback', [PublicReservationController::class, 'handlePaymentCallback'])->name('reservations.callback');

require __DIR__ . '/auth.php';
