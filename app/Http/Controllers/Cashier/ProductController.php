<?php

namespace App\Http\Controllers\Cashier;

use App\Models\Setting;
use Inertia\Inertia;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Imports\ProductImport;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Session;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $by_search = $request->input("search");
        $by_type = $request->input("type");

        $products = Product::query();
        $setting = Setting::first();
        $available_types = $setting->product_types;

        if ($by_search) {
            $products->where(function ($query) use ($by_search) {
                $query
                    ->where("name", "like", "%" . $by_search . "%")
                    ->orWhere("brand", "like", "%" . $by_search . "%");
            });
        }

        if ($by_type) {
            $products->where("type", $by_type);
        }

        $products = $products
            ->withCount("variants")
            ->orderBy("created_at", "desc")
            ->paginate(config("custom.default.pagination_size"));

        return Inertia::render("Cashier/Product/Index", [
            "title" => "Daftar Produk",
            "description" => "Kelola data produk yang tersedia",
            "filters" => $request->only(["search", "type"]),
            "products" => $products,
            "available_types" => $available_types,
        ]);
    }

    public function create()
    {
        $setting = Setting::first();
        $available_types = $setting->product_types;
        return Inertia::render("Cashier/Product/Create", [
            "title" => "Tambah Produk",
            "description" => "Tambah data produk baru",
            "available_types" => $available_types,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(
            [
                "name" => "required|string|max:255",
                "type" => "required|string",
                "brand" => "nullable|string|max:255",
                "with_price_criteria" => "required|boolean",
                "can_earn_point" => "required|boolean",
                "variants" => "required|array|min:1",
                "variants.*.sku" =>
                    "required|string|unique:product_variants,sku",
                "variants.*.attributes" => "required|array",
                "variants.*.price_criteria" => "required|array",
                "variants.*.price_criteria.basic" => "required|integer|min:0",
                "variants.*.price_criteria.reseller" =>
                    "nullable|integer|min:0",
                "variants.*.price_criteria.order_qty_3" =>
                    "nullable|integer|min:0",
                "variants.*.price_criteria.order_qty_6" =>
                    "nullable|integer|min:0",
                "variants.*.stock" => "required|integer|min:0",
            ],
            [
                "variants.*.sku.unique" => "Kode barang sudah digunakan.",
            ],
        );

        if (!$request->with_price_criteria) {
            foreach ($request->variants as $index => $variantData) {
                $request->merge([
                    "variants.{$index}.price_criteria.reseller" => 0,
                    "variants.{$index}.price_criteria.order_qty_3" => 0,
                    "variants.{$index}.price_criteria.order_qty_6" => 0,
                ]);
            }
        }

        DB::transaction(function () use ($request) {
            $product = Product::create([
                "name" => $request->name,
                "type" => $request->type,
                "brand" => $request->brand,
                "with_price_criteria" => $request->with_price_criteria,
                "can_earn_point" => $request->can_earn_point,
            ]);

            foreach ($request->variants as $variantData) {
                $product->variants()->create([
                    "sku" => $variantData["sku"],
                    "attributes" => $variantData["attributes"],
                    "price_criteria" => $variantData["price_criteria"],
                    "stock" => $variantData["stock"],
                ]);
            }
        });

        Session::flash("success", "Produk berhasil ditambahkan");
        return Inertia::location(route("cashier.products.index"));
    }

    public function show($id)
    {
        $product = Product::with("variants")->findOrFail($id);

        return Inertia::render("Cashier/Product/Show", [
            "product" => $product,
            "title" => "Detail Produk",
            "description" => "Informasi detail produk dan varian",
        ]);
    }

    public function edit($id)
    {
        $product = Product::with("variants")->findOrFail($id);
        $setting = Setting::first();
        $available_types = $setting->product_types;
        return Inertia::render("Cashier/Product/Edit", [
            "product" => $product,
            "title" => "Edit Produk",
            "description" => "Ubah data produk dan varian",
            "available_types" => $available_types,
        ]);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            "name" => "required|string|max:255",
            "type" => "required|string",
            "brand" => "nullable|string|max:255",
            "with_price_criteria" => "required|boolean",
            "can_earn_point" => "required|boolean",
            "variants" => "required|array|min:1",
            "variants.*.sku" => [
                "required",
                "string",
                function ($attribute, $value, $fail) use ($request) {
                    if (preg_match("/variants\.(\d+)\.sku/", $attribute, $m)) {
                        $index = $m[1];
                        $variantId = $request->input("variants.$index.id");
                        $query = ProductVariant::where("sku", $value);
                        if ($variantId) {
                            $query->where("id", "!=", $variantId);
                        }
                        if ($query->exists()) {
                            $fail("Kode barang sudah digunakan.");
                        }
                    }
                },
            ],
            "variants.*.attributes" => "required|array",
            "variants.*.price_criteria" => "required|array",
            "variants.*.price_criteria.basic" => "required|integer|min:0",
            "variants.*.price_criteria.reseller" => "nullable|integer|min:0",
            "variants.*.price_criteria.order_qty_3" => "nullable|integer|min:0",
            "variants.*.price_criteria.order_qty_6" => "nullable|integer|min:0",
            "variants.*.stock" => "required|integer|min:0",
        ]);

        if (!$request->with_price_criteria) {
            foreach ($request->variants as $index => $variantData) {
                $request->merge([
                    "variants.{$index}.price_criteria.reseller" => 0,
                    "variants.{$index}.price_criteria.order_qty_3" => 0,
                    "variants.{$index}.price_criteria.order_qty_6" => 0,
                ]);
            }
        }

        // Validate SKU uniqueness (excluding current product variants)
        foreach ($request->variants as $index => $variantData) {
            $skuExists = ProductVariant::where("sku", $variantData["sku"])
                ->where("product_id", "!=", $id)
                ->exists();

            if (isset($variantData["id"])) {
                // Check if SKU changed and conflicts
                $currentVariant = ProductVariant::find($variantData["id"]);
                if (
                    $currentVariant &&
                    $currentVariant->sku !== $variantData["sku"]
                ) {
                    $skuExists = ProductVariant::where(
                        "sku",
                        $variantData["sku"],
                    )
                        ->where("id", "!=", $variantData["id"])
                        ->exists();

                    if ($skuExists) {
                        return back()->withErrors([
                            "variants.{$index}.sku" => "Kode barang sudah digunakan.",
                        ]);
                    }
                }
            } else {
                if ($skuExists) {
                    return back()->withErrors([
                        "variants.{$index}.sku" => "Kode barang sudah digunakan.",
                    ]);
                }
            }
        }

        DB::transaction(function () use ($request, $product) {
            $product->update([
                "name" => $request->name,
                "type" => $request->type,
                "brand" => $request->brand,
                "with_price_criteria" => $request->with_price_criteria,
                "can_earn_point" => $request->can_earn_point,
            ]);

            // Handle Variants
            $submittedVariants = collect($request->variants);
            $existingVariantIds = $product->variants->pluck("id")->toArray();
            $submittedVariantIds = $submittedVariants
                ->pluck("id")
                ->filter()
                ->toArray();

            // Delete removed variants
            $toDelete = array_diff($existingVariantIds, $submittedVariantIds);
            ProductVariant::destroy($toDelete);

            // Update or Create
            foreach ($submittedVariants as $variantData) {
                if (
                    isset($variantData["id"]) &&
                    in_array($variantData["id"], $existingVariantIds)
                ) {
                    // Update
                    $variant = ProductVariant::find($variantData["id"]);
                    $variant->update([
                        "sku" => $variantData["sku"],
                        "attributes" => $variantData["attributes"],
                        "price_criteria" => $variantData["price_criteria"],
                        "stock" => $variantData["stock"],
                    ]);
                } else {
                    // Create
                    $product->variants()->create([
                        "sku" => $variantData["sku"],
                        "attributes" => $variantData["attributes"],
                        "price_criteria" => $variantData["price_criteria"],
                        "stock" => $variantData["stock"],
                    ]);
                }
            }
        });

        Session::flash("success", "Produk berhasil diperbarui");
        return Inertia::location(route("cashier.products.index"));
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        Session::flash("success", "Produk berhasil dihapus");
        return Inertia::location(route("cashier.products.index"));
    }

    public function import(Request $request)
    {
        $request->validate([
            "xlsx_file" => "required|file|mimes:xlsx",
        ]);
        $file = $request->file("xlsx_file");
        try {
            Excel::import(new ProductImport(), $file);
            Session::flash("success", "Data produk berhasil diimpor");
        } catch (\Exception $e) {
            Session::flash("error", $e->getMessage());
        }
        return Inertia::location(route("cashier.products.index"));
    }

    public function labelView()
    {
        $product_variants = ProductVariant::with("product")
            ->orderBy("sku", "asc")
            ->get()
            ->map(function ($variant) {
                return [
                    "id" => $variant->id,
                    "sku" => $variant->sku,
                    "product_id" => $variant->product_id,
                    "stock" => $variant->stock,
                    "product_name" => $variant->product->name,
                    "product_type" => $variant->product->type,
                    "attributes" => $variant->attributes,
                    "price_criteria" => $variant->price_criteria,
                ];
            });
        return Inertia::render("Cashier/Product/Label/Index", [
            "title" => "Cetak Label Produk",
            "description" => "Cetak sekaligus label produk yang diinginkan",
            "product_variants" => $product_variants,
        ]);
    }
}
