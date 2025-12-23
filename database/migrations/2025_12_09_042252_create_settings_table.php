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
            $table->integer("idr_point_value")->default(2500);
            $table->integer("minimum_point_can_used")->default(10);
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
