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
            'name' => 'Contoh 1',
            'type' => Product::TYPE_SHOES,
            'brand' => 'Nike',
        ]);

        ProductVariant::create([
            'product_id' => $product1->id,
            'sku' => 'EXAMPL01',
            'attributes' => [
                'color' => 'Black',
                'size' => 40,
            ],
            'price_criteria' => [
                'basic' => 900000,
                'reseller' => 850000,
                'order_qty_3' => 820000,
                'order_qty_6' => 800000,
            ],
            'stock' => 10,
        ]);

        ProductVariant::create([
            'product_id' => $product1->id,
            'sku' => 'EXAMPL02',
            'attributes' => [
                'color' => 'White',
                'size' => 41,
            ],
            'price_criteria' => [
                'basic' => 900000,
                'reseller' => 850000,
                'order_qty_3' => 820000,
                'order_qty_6' => 800000,
            ],
            'stock' => 10,
        ]);

        ProductVariant::create([
            'product_id' => $product1->id,
            'sku' => 'EXAMPL03',
            'attributes' => [
                'color' => 'Blue',
                'size' => 40,
            ],
            'price_criteria' => [
                'basic' => 900000,
                'reseller' => 850000,
                'order_qty_3' => 820000,
                'order_qty_6' => 800000,
            ],
            'stock' => 10,
        ]);
    }
}
