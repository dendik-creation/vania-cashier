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

Route::get("/", [AuthController::class, "signedInStatus"])->name("login");
Route::prefix("auth")->group(function () {
    Route::get("/signin", [AuthController::class, "signInView"])
        ->name("auth.signin.index")
        ->middleware("guest");

    Route::post("/signin", [AuthController::class, "signIn"])
        ->middleware("guest")
        ->name("auth.signin.store");
});
Route::post("/auth/signout", [AuthController::class, "signOut"])
    ->middleware("auth")
    ->name("auth.signout.store");

// Admin Routes
Route::prefix("admin")
    ->middleware("auth")
    ->group(function () {
        // Dashboard
        Route::get("/dashboard", [
            DashboardController::class,
            "adminDashboard",
        ])->name("admin.dashboard");

        // Master Users
        Route::prefix("users")->group(function () {
            Route::get("/", [AdminUserController::class, "index"])->name(
                "admin.users.index",
            );
            Route::post("/", [AdminUserController::class, "store"])->name(
                "admin.users.store",
            );
            Route::put("/{id}", [AdminUserController::class, "update"])->name(
                "admin.users.update",
            );
            Route::put("/{id}/reset-password", [
                AdminUserController::class,
                "resetPassword",
            ])->name("admin.users.reset-password");
            Route::delete("/{id}", [
                AdminUserController::class,
                "destroy",
            ])->name("admin.users.destroy");
        });

        // Master Customers
        Route::prefix("customers")->group(function () {
            Route::get("/", [AdminCustomerController::class, "index"])->name(
                "admin.customers.index",
            );
            Route::post("/", [AdminCustomerController::class, "store"])->name(
                "admin.customers.store",
            );
            Route::put("/{id}", [
                AdminCustomerController::class,
                "update",
            ])->name("admin.customers.update");
            Route::delete("/{id}", [
                AdminCustomerController::class,
                "destroy",
            ])->name("admin.customers.destroy");
        });

        // Master Products
        Route::prefix("products")->group(function () {
            Route::get("/", [AdminProductController::class, "index"])->name(
                "admin.products.index",
            );
            Route::get("/create", [
                AdminProductController::class,
                "create",
            ])->name("admin.products.create");
            Route::post("/", [AdminProductController::class, "store"])->name(
                "admin.products.store",
            );
            Route::get("/{id}", [AdminProductController::class, "show"])->name(
                "admin.products.show",
            );
            Route::get("/{id}/edit", [
                AdminProductController::class,
                "edit",
            ])->name("admin.products.edit");
            Route::put("/{id}", [
                AdminProductController::class,
                "update",
            ])->name("admin.products.update");
            Route::delete("/{id}", [
                AdminProductController::class,
                "destroy",
            ])->name("admin.products.destroy");
        });

        Route::prefix("transactions")->group(function () {
            Route::get("/find/customer", [
                AdminTransactionController::class,
                "findCustomer",
            ])->name("admin.transactions.findCustomer");
            Route::get("/find/sku", [
                AdminTransactionController::class,
                "findSku",
            ])->name("admin.transactions.findSku");
            Route::get("/records", [
                AdminTransactionController::class,
                "index",
            ])->name("admin.transactions.index");
            Route::get("/create", [
                AdminTransactionController::class,
                "create",
            ])->name("admin.transactions.create");
            Route::post("/", [
                AdminTransactionController::class,
                "store",
            ])->name("admin.transactions.store");
            Route::get("/{id}", [
                AdminTransactionController::class,
                "show",
            ])->name("admin.transactions.show");
        });
    });
