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
        Schema::create("product_rejects", function (Blueprint $table) {
            $table->id();

            $table
                ->foreignId("variant_id")
                ->constrained("product_variants")
                ->cascadeOnDelete();

            $table->integer("quantity");
            $table->text("reason");
            $table->dateTime("rejected_at");
            $table->enum("status", ["pending", "done"])->default("pending");

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("product_rejects");
    }
};
