<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Enable foreign key constraints for SQLite
        if (\DB::getDriverName() === "sqlite") {
            \DB::statement("PRAGMA foreign_keys = ON;");
        }

        Schema::table("settings", function (Blueprint $table) {
            $table
                ->json("product_types")
                ->default('["tas", "sepatu", "aksesoris"]');
        });

        \DB::table("products")
            ->where("type", "shoes")
            ->update(["type" => "sepatu"]);
        \DB::table("products")
            ->where("type", "bag")
            ->update(["type" => "tas"]);
        \DB::table("products")
            ->where("type", "accessory")
            ->update(["type" => "aksesoris"]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Enable foreign key constraints for SQLite
        if (\DB::getDriverName() === "sqlite") {
            \DB::statement("PRAGMA foreign_keys = ON;");
        }

        Schema::table("settings", function (Blueprint $table) {
            $table->dropColumn("product_types");
        });

        \DB::table("products")
            ->where("type", "sepatu")
            ->update(["type" => "shoes"]);
        \DB::table("products")
            ->where("type", "tas")
            ->update(["type" => "bag"]);
        \DB::table("products")
            ->where("type", "aksesoris")
            ->update(["type" => "accessory"]);
    }
};
