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
        Schema::create("transaction_items", function (Blueprint $table) {
            $table->id();

            $table
                ->foreignId("transaction_id")
                ->constrained("transactions")
                ->cascadeOnDelete();

            $table
                ->foreignId("variant_id")
                ->constrained("product_variants")
                ->cascadeOnDelete();

            $table->integer("price_per_item");
            $table->integer("quantity");
            $table->integer("subtotal");

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("transaction_items");
    }
};
