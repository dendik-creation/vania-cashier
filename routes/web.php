<?php

use Illuminate\Support\Facades\Route;
// Global Controllers
use App\Http\Controllers\Global\AuthController;
use App\Http\Controllers\Global\DashboardController;
// Admin Controllers
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;

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
            Route::put("/{id}/reset-password", [
                AdminCustomerController::class,
                "resetPassword",
            ])->name("admin.customers.reset-password");
            Route::delete("/{id}", [
                AdminCustomerController::class,
                "destroy",
            ])->name("admin.customers.destroy");
        });
    });
