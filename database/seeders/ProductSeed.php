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
            'name' => 'Nike Air Max 270',
            'type' => Product::TYPE_SHOES,
            'brand' => 'Nike',
        ]);

        ProductVariant::create([
            'product_id' => $product1->id,
            'sku' => 'NIKE270-BLK-40',
            'attributes' => [
                'color' => 'Black',
                'size' => 40,
            ],
            'price_criteria' => [
                'basic' => 1200000,
                'reseller' => 1100000,
                'order_qty_3' => 1050000,
                'order_qty_6' => 1000000,
            ],
            'stock' => 10,
        ]);

        ProductVariant::create([
            'product_id' => $product1->id,
            'sku' => 'NIKE270-BLK-41',
            'attributes' => [
                'color' => 'Black',
                'size' => 41,
            ],
            'price_criteria' => [
                'basic' => 1200000,
                'reseller' => 1100000,
                'order_qty_3' => 1050000,
                'order_qty_6' => 1000000,
            ],
            'stock' => 15,
        ]);

        ProductVariant::create([
            'product_id' => $product1->id,
            'sku' => 'NIKE270-WHT-40',
            'attributes' => [
                'color' => 'White',
                'size' => 40,
            ],
            'price_criteria' => [
                'basic' => 1200000,
                'reseller' => 1100000,
                'order_qty_3' => 1050000,
                'order_qty_6' => 1000000,
            ],
            'stock' => 8,
        ]);

        $product2 = Product::create([
            'name' => 'Gucci Marmont Shoulder Bag',
            'type' => Product::TYPE_BAG,
            'brand' => 'Gucci',
        ]);

        ProductVariant::create([
            'product_id' => $product2->id,
            'sku' => 'GUCCI-MAR-BLK',
            'attributes' => [
                'color' => 'Black',
                'material' => 'Leather',
            ],
            'price_criteria' => [
                'basic' => 5000000,
                'reseller' => 4700000,
                'order_qty_3' => 4500000,
                'order_qty_6' => 4300000,
            ],
            'stock' => 5,
        ]);

        ProductVariant::create([
            'product_id' => $product2->id,
            'sku' => 'GUCCI-MAR-RED',
            'attributes' => [
                'color' => 'Red',
                'material' => 'Leather',
            ],
            'price_criteria' => [
                'basic' => 5200000,
                'reseller' => 4900000,
                'order_qty_3' => 4700000,
                'order_qty_6' => 4500000,
            ],
            'stock' => 3,
        ]);

        $product3 = Product::create([
            'name' => 'Adidas Ultraboost 22',
            'type' => Product::TYPE_SHOES,
            'brand' => 'Adidas',
        ]);

        ProductVariant::create([
            'product_id' => $product3->id,
            'sku' => 'ADIDAS-UB22-BLK-42',
            'attributes' => [
                'color' => 'Black',
                'size' => 42,
            ],
            'price_criteria' => [
                'basic' => 1500000,
                'reseller' => 1400000,
                'order_qty_3' => 1350000,
                'order_qty_6' => 1300000,
            ],
            'stock' => 12,
        ]);

        ProductVariant::create([
            'product_id' => $product3->id,
            'sku' => 'ADIDAS-UB22-WHT-43',
            'attributes' => [
                'color' => 'White',
                'size' => 43,
            ],
            'price_criteria' => [
                'basic' => 1500000,
                'reseller' => 1400000,
                'order_qty_3' => 1350000,
                'order_qty_6' => 1300000,
            ],
            'stock' => 20,
        ]);

        $product4 = Product::create([
            'name' => 'Louis Vuitton Wallet',
            'type' => Product::TYPE_ACCESSORY,
            'brand' => 'Louis Vuitton',
        ]);

        ProductVariant::create([
            'product_id' => $product4->id,
            'sku' => 'LV-WALLET-BRN',
            'attributes' => [
                'color' => 'Brown',
                'material' => 'Canvas',
            ],
            'price_criteria' => [
                'basic' => 3000000,
                'reseller' => 2800000,
                'order_qty_3' => 2700000,
                'order_qty_6' => 2600000,
            ],
            'stock' => 7,
        ]);

        $product5 = Product::create([
            'name' => 'Converse Chuck Taylor All Star',
            'type' => Product::TYPE_SHOES,
            'brand' => 'Converse',
        ]);

        ProductVariant::create([
            'product_id' => $product5->id,
            'sku' => 'CONV-CT-BLK-39',
            'attributes' => [
                'color' => 'Black',
                'size' => 39,
            ],
            'price_criteria' => [
                'basic' => 600000,
                'reseller' => 550000,
                'order_qty_3' => 520000,
                'order_qty_6' => 500000,
            ],
            'stock' => 25,
        ]);

        ProductVariant::create([
            'product_id' => $product5->id,
            'sku' => 'CONV-CT-WHT-40',
            'attributes' => [
                'color' => 'White',
                'size' => 40,
            ],
            'price_criteria' => [
                'basic' => 600000,
                'reseller' => 550000,
                'order_qty_3' => 520000,
                'order_qty_6' => 500000,
            ],
            'stock' => 30,
        ]);
    }
}
