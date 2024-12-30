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

Route::get('/menu-selection/{type?}', function ($type = 'takeaway') {
    return Inertia::render('MenuSelection', [
        'orderType' => $type,
    ]);
})->name('menu-selection');

Route::get('/takeaway-checkout', function () {
    return Inertia::render('TakeawayCheckout');
})->name('takeaway-checkout');

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

require __DIR__ . '/auth.php';
