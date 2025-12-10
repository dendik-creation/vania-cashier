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
        Schema::create("transactions", function (Blueprint $table) {
            $table->id();

            $table
                ->foreignId("cashier_id")
                ->constrained("users")
                ->cascadeOnDelete();

            $table->enum("customer_type", ["general", "member", "reseller"]);
            $table
                ->foreignId("customer_id")
                ->nullable()
                ->constrained("customers")
                ->nullOnDelete();

            $table->integer("points_earned")->default(0);
            $table->integer("point_used")->default(0);

            $table->integer("subtotal");
            $table->integer("discount")->default(0);
            $table->integer("total");

            $table->enum("payment_method", ["cash", "qris", "transfer"]);
            $table->integer("admin_fee")->default(0);

            $table->dateTime("transaction_time");

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("transactions");
    }
};
