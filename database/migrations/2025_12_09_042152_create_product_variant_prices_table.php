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
        Schema::create("product_variant_prices", function (Blueprint $table) {
            $table->id();
            $table
                ->foreignId("variant_id")
                ->constrained("product_variants")
                ->cascadeOnDelete();

            $table->enum("customer_type", ["general", "member", "reseller"]);
            $table->integer("min_qty")->default(1);
            $table->integer("price");

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("product_variant_prices");
    }
};
