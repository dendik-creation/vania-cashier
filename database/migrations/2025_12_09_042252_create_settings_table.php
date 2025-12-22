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
        Schema::create("settings", function (Blueprint $table) {
            $table->id();
            $table->string("app_name");
            $table->string("app_logo")->nullable();
            $table->string("app_address")->nullable();
            $table->integer("eligible_point_minimum")->default(50000);
            $table->json("admin_fee_criteria");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("settings");
    }
};
