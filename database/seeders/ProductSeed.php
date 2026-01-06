<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

class ProductSeed extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $product1 = Product::create([
            "name" => "Contoh 1",
            "type" => "sepatu",
            "brand" => "Nike",
            "with_price_criteria" => true,
        ]);

        ProductVariant::create([
            "product_id" => $product1->id,
            "sku" => "EXAMPL01",
            "attributes" => [
                "color" => "Black",
                "size" => 40,
            ],
            "price_criteria" => [
                "basic" => 90000,
                "reseller" => 85000,
                "order_qty_3" => 82000,
                "order_qty_6" => 80000,
            ],
            "stock" => 10,
        ]);

        ProductVariant::create([
            "product_id" => $product1->id,
            "sku" => "EXAMPL02",
            "attributes" => [
                "color" => "White",
                "size" => 41,
            ],
            "price_criteria" => [
                "basic" => 90000,
                "reseller" => 85000,
                "order_qty_3" => 82000,
                "order_qty_6" => 80000,
            ],
            "stock" => 10,
        ]);

        ProductVariant::create([
            "product_id" => $product1->id,
            "sku" => "EXAMPL03",
            "attributes" => [
                "color" => "Blue",
                "size" => 40,
            ],
            "price_criteria" => [
                "basic" => 90000,
                "reseller" => 86000,
                "order_qty_3" => 84000,
                "order_qty_6" => 81000,
            ],
            "stock" => 10,
        ]);
    }
}
