<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\ProductVariant;
use App\Models\Setting;
use Inertia\Inertia;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function findCustomer(Request $request)
    {
        $validated = $request->validate([
            "phone" => "required",
        ]);
        $customer = Customer::where("phone", $validated["phone"])->first();
        if (!$customer) {
            return response()->json(
                [
                    "message" => "Pelanggan tidak ditemukan",
                ],
                404,
            );
        }
        return response()->json([
            "customer" => $customer,
        ]);
    }

    public function findSKU(Request $request)
    {
        $validated = $request->validate([
            "sku" => "required",
        ]);
        $product_variant = ProductVariant::where("sku", $validated["sku"])
            ->with("product")
            ->first();
        if (!$product_variant) {
            return response()->json(
                [
                    "message" => "Produk dengan SKU tersebut tidak ditemukan",
                ],
                404,
            );
        }
        if (count($product_variant->stock) == 0) {
            return response()->json(
                [
                    "message" => "Produk dengan SKU stoknya habis",
                ],
                404,
            );
        }
        $product_variant["attributes"] = json_decode(
            $product_variant["attributes"],
        );
        $product_variant["price_criteria"] = json_decode(
            $product_variant["price_criteria"],
        );
        return response()->json([
            "product_variant" => [
                "id" => $product_variant->id,
                "sku" => $product_variant->sku,
                "product_name" => $product_variant->product->name,
                "attributes" => $product_variant->attributes,
                "price_criteria" => $product_variant->price_criteria,
                "price_applied" => 0,
                "product_type" => $product_variant->product->type,
            ],
        ]);
    }

    public function create()
    {
        $setting = Setting::first();
        return Inertia::render("Admin/Transaction/Create", [
            "admin_fee_criteria" => json_decode($setting->admin_fee_criteria),
            "eligible_point_minimum" => $setting->eligible_point_minimum,
            "title" => "Transaksi Baru",
            "description" => "Buat transaksi baru untuk pelanggan",
        ]);
    }
}
