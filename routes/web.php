<?php

use Illuminate\Support\Facades\Route;
// Global Controllers
use App\Http\Controllers\Global\AuthController;
use App\Http\Controllers\Global\DashboardController;
// Admin Controllers
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\TransactionController as AdminTransactionController;
use App\Http\Controllers\Admin\ProductRejectController as AdminProductRejectController;
use App\Http\Controllers\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
// Cashier Controllers
use App\Http\Controllers\Cashier\CustomerController as CashierCustomerController;
use App\Http\Controllers\Cashier\ProductController as CashierProductController;
use App\Http\Controllers\Cashier\TransactionController as CashierTransactionController;
// Middlewares
use App\Http\Middleware\adminAccess;
use App\Http\Middleware\cashierAccess;

Route::get('/', [AuthController::class, 'signedInStatus'])->name('login');
Route::prefix('auth')->group(function () {
    Route::get('/signin', [AuthController::class, 'signInView'])
        ->name('auth.signin.index')
        ->middleware('guest');

    Route::post('/signin', [AuthController::class, 'signIn'])
        ->middleware('guest')
        ->name('auth.signin.store');
});
Route::post('/auth/signout', [AuthController::class, 'signOut'])
    ->middleware('auth')
    ->name('auth.signout.store');

// Admin Routes
Route::prefix('admin')
    ->middleware('auth', adminAccess::class)
    ->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'adminDashboard'])->name('admin.dashboard');

        // Master Users
        Route::prefix('users')->group(function () {
            Route::get('/', [AdminUserController::class, 'index'])->name('admin.users.index');
            Route::post('/', [AdminUserController::class, 'store'])->name('admin.users.store');
            Route::put('/{id}', [AdminUserController::class, 'update'])->name('admin.users.update');
            Route::put('/{id}/reset-password', [AdminUserController::class, 'resetPassword'])->name('admin.users.reset-password');
            Route::delete('/{id}', [AdminUserController::class, 'destroy'])->name('admin.users.destroy');
        });

        // Master Customers
        Route::prefix('customers')->group(function () {
            Route::get('/', [AdminCustomerController::class, 'index'])->name('admin.customers.index');
            Route::post('/', [AdminCustomerController::class, 'store'])->name('admin.customers.store');
            Route::put('/{id}', [AdminCustomerController::class, 'update'])->name('admin.customers.update');
            Route::delete('/{id}', [AdminCustomerController::class, 'destroy'])->name('admin.customers.destroy');
        });

        // Master Products
        Route::prefix('products')->group(function () {
            // Label
            Route::get('/label', [AdminProductController::class, 'labelView'])->name('admin.products.labelView');

            Route::get('/', [AdminProductController::class, 'index'])->name('admin.products.index');
            Route::get('/create', [AdminProductController::class, 'create'])->name('admin.products.create');
            Route::post('/', [AdminProductController::class, 'store'])->name('admin.products.store');
            Route::post('/import', [AdminProductController::class, 'import'])->name('admin.products.import');
            Route::get('/{id}', [AdminProductController::class, 'show'])->name('admin.products.show');
            Route::get('/{id}/edit', [AdminProductController::class, 'edit'])->name('admin.products.edit');
            Route::put('/{id}', [AdminProductController::class, 'update'])->name('admin.products.update');
            Route::delete('/{id}', [AdminProductController::class, 'destroy'])->name('admin.products.destroy');
        });

        // Route product rejects
        Route::prefix('product-rejects')->group(function () {
            Route::get('/', [AdminProductRejectController::class, 'index'])->name('admin.product-rejects.index');
            Route::get('/find-variant', [AdminProductRejectController::class, 'getProductVariantsOptions'])->name('admin.product-rejects.find-variant');
            Route::post('/', [AdminProductRejectController::class, 'store'])->name('admin.product-rejects.store');
            Route::put('/{id}', [AdminProductRejectController::class, 'update'])->name('admin.product-rejects.update');
            Route::delete('/{id}', [AdminProductRejectController::class, 'destroy'])->name('admin.product-rejects.destroy');
        });

        // Route transactions
        Route::prefix('transactions')->group(function () {
            Route::get('/find/customer', [AdminTransactionController::class, 'findCustomer'])->name('admin.transactions.findCustomer');
            Route::get('/find/sku', [AdminTransactionController::class, 'findSku'])->name('admin.transactions.findSku');
            Route::get('/records', [AdminTransactionController::class, 'index'])->name('admin.transactions.index');
            Route::get('/create', [AdminTransactionController::class, 'create'])->name('admin.transactions.create');
            Route::get('/print/{id}', [AdminTransactionController::class, 'findTrxForPrint'])->name('admin.transactions.findTrxForPrint');
            Route::post('/', [AdminTransactionController::class, 'store'])->name('admin.transactions.store');
            Route::get('/{id}', [AdminTransactionController::class, 'show'])->name('admin.transactions.show');
            Route::put('/{id}', [AdminTransactionController::class, 'update'])->name('admin.transactions.update');
            Route::get('/{id}/edit', [AdminTransactionController::class, 'edit'])->name('admin.transactions.edit');
            Route::delete('/{id}', [AdminTransactionController::class, 'destroy'])->name('admin.transactions.destroy');
        });

        // Sales Reports Routes
        Route::prefix('reports')->group(function () {
            Route::get('/', [AdminReportController::class, 'index'])->name('admin.reports.index');
            Route::get('/export', [AdminReportController::class, 'export'])->name('admin.reports.export');
        });

        // App Settings Routes
        Route::prefix('settings')->group(function () {
            Route::get('/', [AdminSettingController::class, 'index'])->name('admin.settings.index');
            Route::put('/', [AdminSettingController::class, 'update'])->name('admin.settings.update');
        });
    });


// Cashier Routes
Route::prefix('cashier')
    ->middleware('auth', cashierAccess::class)
    ->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'cashierDashboard'])->name('cashier.dashboard');

        // Master Customers
        Route::prefix('customers')->group(function () {
            Route::get('/', [CashierCustomerController::class, 'index'])->name('cashier.customers.index');
            Route::post('/', [CashierCustomerController::class, 'store'])->name('cashier.customers.store');
            Route::put('/{id}', [CashierCustomerController::class, 'update'])->name('cashier.customers.update');
            Route::delete('/{id}', [CashierCustomerController::class, 'destroy'])->name('cashier.customers.destroy');
        });

        // Master Products
        Route::prefix('products')->group(function () {
            // Label
            Route::get('/label', [CashierProductController::class, 'labelView'])->name('cashier.products.labelView');

            Route::get('/', [CashierProductController::class, 'index'])->name('cashier.products.index');
            Route::get('/create', [CashierProductController::class, 'create'])->name('cashier.products.create');
            Route::post('/', [CashierProductController::class, 'store'])->name('cashier.products.store');
            Route::post('/import', [CashierProductController::class, 'import'])->name('cashier.products.import');
            Route::get('/{id}', [CashierProductController::class, 'show'])->name('cashier.products.show');
            Route::get('/{id}/edit', [CashierProductController::class, 'edit'])->name('cashier.products.edit');
            Route::put('/{id}', [CashierProductController::class, 'update'])->name('cashier.products.update');
            Route::delete('/{id}', [CashierProductController::class, 'destroy'])->name('cashier.products.destroy');
        });

        // Route transactions
        Route::prefix('transactions')->group(function () {
            Route::get('/find/customer', [CashierTransactionController::class, 'findCustomer'])->name('cashier.transactions.findCustomer');
            Route::get('/find/sku', [CashierTransactionController::class, 'findSku'])->name('cashier.transactions.findSku');
            Route::get('/records', [CashierTransactionController::class, 'index'])->name('cashier.transactions.index');
            Route::get('/create', [CashierTransactionController::class, 'create'])->name('cashier.transactions.create');
            Route::get('/print/{id}', [CashierTransactionController::class, 'findTrxForPrint'])->name('cashier.transactions.findTrxForPrint');
            Route::post('/', [CashierTransactionController::class, 'store'])->name('cashier.transactions.store');
            Route::get('/{id}', [CashierTransactionController::class, 'show'])->name('cashier.transactions.show');
            Route::put('/{id}', [CashierTransactionController::class, 'update'])->name('cashier.transactions.update');
            Route::get('/{id}/edit', [CashierTransactionController::class, 'edit'])->name('cashier.transactions.edit');
            Route::delete('/{id}', [CashierTransactionController::class, 'destroy'])->name('cashier.transactions.destroy');
        });
    });

