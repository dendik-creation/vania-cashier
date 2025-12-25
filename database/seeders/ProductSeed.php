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
            'sku' => 'NIKE270BLK40',
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
            'sku' => 'NIKE270BLK41',
            'attributes' => [
                'color' => 'Black',
                'size' => 41,
            ],
            'price_criteria' => [
                'basic' => 900000,
                'reseller' => 850000,
                'order_qty_3' => 820000,
                'order_qty_6' => 800000,
            ],
            'stock' => 15,
        ]);

        ProductVariant::create([
            'product_id' => $product1->id,
            'sku' => 'NIKE270WHT40',
            'attributes' => [
                'color' => 'White',
                'size' => 40,
            ],
            'price_criteria' => [
                'basic' => 900000,
                'reseller' => 850000,
                'order_qty_3' => 820000,
                'order_qty_6' => 800000,
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
            'sku' => 'GUCCIMARBLK',
            'attributes' => [
                'color' => 'Black',
                'material' => 'Leather',
            ],
            'price_criteria' => [
                'basic' => 3500000,
                'reseller' => 3300000,
                'order_qty_3' => 3200000,
                'order_qty_6' => 3100000,
            ],
            'stock' => 5,
        ]);

        ProductVariant::create([
            'product_id' => $product2->id,
            'sku' => 'GUCCIMARRED',
            'attributes' => [
                'color' => 'Red',
                'material' => 'Leather',
            ],
            'price_criteria' => [
                'basic' => 3700000,
                'reseller' => 3500000,
                'order_qty_3' => 3400000,
                'order_qty_6' => 3300000,
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
            'sku' => 'ADIDASUB22BLK42',
            'attributes' => [
                'color' => 'Black',
                'size' => 42,
            ],
            'price_criteria' => [
                'basic' => 1100000,
                'reseller' => 1050000,
                'order_qty_3' => 1020000,
                'order_qty_6' => 1000000,
            ],
            'stock' => 12,
        ]);

        ProductVariant::create([
            'product_id' => $product3->id,
            'sku' => 'ADIDASUB22WHT43',
            'attributes' => [
                'color' => 'White',
                'size' => 43,
            ],
            'price_criteria' => [
                'basic' => 1100000,
                'reseller' => 1050000,
                'order_qty_3' => 1020000,
                'order_qty_6' => 1000000,
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
            'sku' => 'LVWALLETBRN',
            'attributes' => [
                'color' => 'Brown',
                'material' => 'Canvas',
            ],
            'price_criteria' => [
                'basic' => 2100000,
                'reseller' => 2000000,
                'order_qty_3' => 1950000,
                'order_qty_6' => 1900000,
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
            'sku' => 'CONVCTBLK39',
            'attributes' => [
                'color' => 'Black',
                'size' => 39,
            ],
            'price_criteria' => [
                'basic' => 400000,
                'reseller' => 370000,
                'order_qty_3' => 350000,
                'order_qty_6' => 340000,
            ],
            'stock' => 25,
        ]);

        ProductVariant::create([
            'product_id' => $product5->id,
            'sku' => 'CONVCTWHT40',
            'attributes' => [
                'color' => 'White',
                'size' => 40,
            ],
            'price_criteria' => [
                'basic' => 400000,
                'reseller' => 370000,
                'order_qty_3' => 350000,
                'order_qty_6' => 340000,
            ],
            'stock' => 30,
        ]);
    }
}
