<?php

namespace App\Http\Controllers\Cashier;

use Inertia\Inertia;
use App\Models\Setting;
use App\Models\Customer;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

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
                    "message" => "Produk tersebut tidak ditemukan",
                ],
                404,
            );
        }
        if ($product_variant->stock == 0) {
            return response()->json(
                [
                    "message" => "Produk tersebut stoknya habis",
                ],
                404,
            );
        }
        return response()->json(
            [
                "product_variant" => [
                    "id" => $product_variant->id,
                    "sku" => $product_variant->sku,
                    "product_name" => $product_variant->product->name,
                    "attributes" => $product_variant->attributes,
                    "price_criteria" => $product_variant->price_criteria,
                    "price_applied" => 0,
                    "product_type" => $product_variant->product->type,
                    "can_earn_point" =>
                        $product_variant->product->can_earn_point,
                    "stock_remaining" => $product_variant->stock,
                ],
            ],
            200,
        );
    }

    public function index(Request $request)
    {
        $by_search = $request->query("search", "");
        $by_customer_type = $request->query("customer_type", "");
        $by_payment_method = $request->query("payment_method", "");
        $by_start_date = $request->query("start_date", "");
        $by_end_date = $request->query("end_date", "");

        $transactions = Transaction::with(["customer", "cashier", "items"])
            ->when($by_search, function ($query, $by_search) {
                $query
                    ->where("invoice_code", "like", "%{$by_search}%")
                    ->orWhereHas("customer", function ($q) use ($by_search) {
                        $q->where("name", "like", "%{$by_search}%");
                        $q->orWhere("phone", "like", "%{$by_search}%");
                    });
            })
            ->when($by_customer_type, function ($query, $by_customer_type) {
                $query->where("customer_type", $by_customer_type);
            })
            ->when($by_start_date, function ($query, $by_start_date) {
                $query->whereDate("transaction_time", ">=", $by_start_date);
            })
            ->when($by_end_date, function ($query, $by_end_date) {
                $query->whereDate("transaction_time", "<=", $by_end_date);
            })
            ->when($by_payment_method, function ($query, $by_payment_method) {
                $query->where("payment_method", $by_payment_method);
            })
            // by auth cashier_id
            // ->where('cashier_id', Auth::user()->id)
            ->orderBy("created_at", "desc")
            ->paginate(10);

        foreach ($transactions as $transaction) {
            $sku_sold = 0;
            foreach ($transaction->items as $item) {
                $sku_sold += $item->quantity;
            }
            $transaction->sku_sold = $sku_sold;
        }
        return Inertia::render("Cashier/Transaction/Index", [
            "title" => "Daftar Transaksi",
            "description" => "Kelola informasi transaksi pelanggan",
            "transactions" => $transactions,
            "filters" => [
                "search" => $by_search,
                "customer_type" => $by_customer_type,
                "payment_method" => $by_payment_method,
                "start_date" => $by_start_date,
                "end_date" => $by_end_date,
            ],
        ]);
    }

    public function create()
    {
        $setting = Setting::first();
        return Inertia::render("Cashier/Transaction/Create", [
            "admin_fee_criteria" => $setting->admin_fee_criteria,
            "eligible_point_minimum" => $setting->eligible_point_minimum,
            "idr_point_value" => $setting->idr_point_value,
            "minimum_point_can_used" => $setting->minimum_point_can_used,
            "title" => "Transaksi Baru",
            "description" => "Buat transaksi baru untuk pelanggan",
        ]);
    }

    private function recalculatePointEarned($items)
    {
        $setting = Setting::first();
        $points = 0;
        foreach ($items as $item) {
            if (
                $item["can_earn_point"] &&
                $item["price_applied"] > $setting->eligible_point_minimum
            ) {
                $points += $item["qty"];
            }
        }
        return $points;
    }

    private function discountInDecimal($point_used)
    {
        $setting = Setting::first();
        return $point_used * $setting->idr_point_value;
    }

    private function generateInvoiceCode()
    {
        $datePart = date("Ymd");
        $countInvoiceToday =
            Transaction::whereDate(
                "created_at",
                now()->toDateString(),
            )->count() + 1;
        return "TRX-" .
            $datePart .
            "-" .
            str_pad($countInvoiceToday, 4, "0", STR_PAD_LEFT);
    }

    private function recalculateSubtotal($items)
    {
        return collect($items)->sum(function ($item) {
            return $item["price_applied"] * $item["qty"];
        });
    }

    private function recalculateTotal($subtotal, $discount, $admin_fee)
    {
        return $subtotal - $discount + $admin_fee;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "is_new_customer" => ["required", "boolean"],
            "customer_id" => ["nullable", "numeric"],
            // cust register as member
            "register_customer" => ["nullable", "array"],
            "register_customer.name" => ["nullable", "string"],
            "register_customer.phone" => ["nullable", "string"],
            "register_customer.address" => ["nullable", "string"],
            "customer_type" => ["nullable", "string"],
            "payment_method" => ["required", "string"],
            "items" => ["required", "array", "min:1"],
            "items.*.id" => ["required", "numeric"],
            "items.*.sku" => ["required", "string"],
            "items.*.product_name" => ["required", "string"],
            "items.*.attributes" => ["required", "array"],
            "items.*.attributes.color" => ["required", "string"],
            "items.*.price_applied" => ["required", "numeric"],
            "items.*.price_criteria" => ["required", "array"],
            "items.*.price_criteria.basic" => ["required", "numeric"],
            "items.*.price_criteria.reseller" => ["required", "numeric"],
            "items.*.price_criteria.order_qty_3" => ["required", "numeric"],
            "items.*.price_criteria.order_qty_6" => ["required", "numeric"],
            "items.*.product_type" => ["required", "string"],
            "items.*.can_earn_point" => ["required", "boolean"],
            "items.*.qty" => ["required", "integer", "min:1"],
            "subtotal" => ["required", "numeric"],
            "point_used" => ["required", "numeric"],
            "point_earned" => ["required", "numeric"],
            "discount" => ["required", "numeric"],
            "admin_fee" => ["required", "numeric"],
            "total" => ["required", "numeric"],
        ]);
        $cashier_id = Auth::user()->id;

        // pelanggan umum (tidak join😭)
        if (
            $validated["is_new_customer"] ||
            (isset($validated["register_customer"]["name"]) &&
                isset($validated["register_customer"]["phone"]) &&
                isset($validated["register_customer"]["address"]) &&
                (empty($validated["register_customer"]["name"]) ||
                    empty($validated["register_customer"]["phone"]) ||
                    empty($validated["register_customer"]["address"])))
        ) {
            $validated["customer_id"] = null;
            $validated["customer_type"] = "general";
        }
        // Simpan customer baru jika diperlukan
        if (
            $validated["is_new_customer"] &&
            isset($validated["register_customer"]) &&
            isset($validated["register_customer"]["name"]) &&
            isset($validated["register_customer"]["phone"]) &&
            isset($validated["register_customer"]["address"]) &&
            !empty($validated["register_customer"]["name"]) &&
            !empty($validated["register_customer"]["phone"]) &&
            !empty($validated["register_customer"]["address"])
        ) {
            $customer = Customer::create([
                "name" => $validated["register_customer"]["name"],
                "phone" => $validated["register_customer"]["phone"],
                "address" => $validated["register_customer"]["address"],
                "type" => $validated["register_customer"]["type"] ?? "member",
                "points" => 0,
                "joined_at" => now()->format("Y-m-d"),
            ]);
            $validated["customer_id"] = $customer->id;
            $validated["customer_type"] = "member";
        }
        // Validasi dan persiapan item
        $items = [];
        foreach ($validated["items"] as $item) {
            $product_variant = ProductVariant::find($item["id"]);
            if (!$product_variant) {
                return response()->json(
                    [
                        "message" =>
                            "Kode Produk " . $item["sku"] . " tidak ditemukan",
                    ],
                    404,
                );
            }
            if ($product_variant->stock < $item["qty"]) {
                return response()->json(
                    [
                        "message" =>
                            "Stok produk " . $item["sku"] . " tidak mencukupi",
                    ],
                    400,
                );
            }
            $items[] = $item;
        }

        // Hitung ulang subtotal, point, diskon, total
        $subtotal = $this->recalculateSubtotal($items);
        $point_earned = $this->recalculatePointEarned($items);
        $point_used = $validated["point_used"];
        $admin_fee = $validated["admin_fee"];
        $discount = $this->discountInDecimal($point_used);
        $total = $this->recalculateTotal($subtotal, $discount, $admin_fee);

        // Simpan transaksi ke database
        $transaction = Transaction::create([
            "invoice_code" => $this->generateInvoiceCode(),
            "cashier_id" => $cashier_id,
            "customer_type" => $validated["customer_type"] ?: "general",
            "customer_id" => $validated["customer_id"] ?: null,
            "point_earned" => $point_earned,
            "point_used" => $point_used,
            "subtotal" => $subtotal,
            "discount" => $discount,
            "total" => $total,
            "payment_method" => $validated["payment_method"],
            "admin_fee" => $admin_fee,
            "transaction_time" => now(),
        ]);

        // Simpan item transaksi ke database
        $transaction_items = collect($items)
            ->map(function ($item) use ($transaction) {
                return [
                    "transaction_id" => $transaction->id,
                    "variant_id" => $item["id"],
                    "quantity" => $item["qty"],
                    "price_per_item" => $item["price_applied"],
                    "subtotal" => $item["price_applied"] * $item["qty"],
                ];
            })
            ->toArray();
        $transaction->items()->createMany($transaction_items);

        // Update stok produk
        foreach ($items as $item) {
            $product_variant = ProductVariant::find($item["id"]);
            $product_variant->decrement("stock", $item["qty"]);
        }

        // Update poin pelanggan
        if ($validated["customer_id"]) {
            $customer = Customer::find($validated["customer_id"]);
            if ($customer) {
                if ($point_used > 0) {
                    $customer->decrement("points", $point_used);
                }
                if ($point_earned > 0) {
                    $customer->increment("points", $point_earned);
                }
            }
        }

        return response()->json([
            "message" => "Transaksi berhasil disimpan",
            "transaction_id" => $transaction->id,
        ]);
    }

    public function show($id)
    {
        $transaction = Transaction::with(
            "customer",
            "cashier",
            "items.variant.product",
        )->find($id);
        if (!$transaction) {
            return back()->with("error", "Transaksi tidak ditemukan");
        }
        return Inertia::render("Cashier/Transaction/Show", [
            "title" => "Detail Transaksi",
            "description" => "Informasi lengkap transaksi pelanggan",
            "transaction" => $transaction,
        ]);
    }

    public function edit($id)
    {
        $setting = Setting::first();
        $transaction = Transaction::with(
            "customer",
            "cashier",
            "items.variant.product",
        )->find($id);
        if (!$transaction) {
            return back()->with("error", "Transaksi tidak ditemukan");
        }
        if ($transaction->cashier_id != Auth::user()->id) {
            return back()->with(
                "error",
                "Transaksi ini bukan milik kasir lain",
            );
        }
        return Inertia::render("Cashier/Transaction/Edit", [
            "admin_fee_criteria" => $setting->admin_fee_criteria,
            "eligible_point_minimum" => $setting->eligible_point_minimum,
            "idr_point_value" => $setting->idr_point_value,
            "minimum_point_can_used" => $setting->minimum_point_can_used,
            "title" => "Edit Transaksi",
            "description" => "Edit transaksi untuk pelanggan",
            "transaction" => $transaction,
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            "is_new_customer" => ["required", "boolean"],
            "customer_id" => ["nullable", "numeric"],
            "customer_type" => ["nullable", "string"],
            "register_customer" => ["nullable", "array"],
            "payment_method" => ["required", "string"],
            "items" => ["required", "array", "min:1"],
            "items.*.id" => ["required", "numeric"],
            "items.*.sku" => ["required", "string"],
            "items.*.product_name" => ["required", "string"],
            "items.*.attributes" => ["required", "array"],
            "items.*.attributes.color" => ["required", "string"],
            "items.*.price_applied" => ["required", "numeric"],
            "items.*.price_criteria" => ["required", "array"],
            "items.*.price_criteria.basic" => ["required", "numeric"],
            "items.*.price_criteria.reseller" => ["required", "numeric"],
            "items.*.price_criteria.order_qty_3" => ["required", "numeric"],
            "items.*.price_criteria.order_qty_6" => ["required", "numeric"],
            "items.*.product_type" => ["required", "string"],
            "items.*.can_earn_point" => ["required", "boolean"],
            "items.*.qty" => ["required", "integer", "min:1"],
            "subtotal" => ["required", "numeric"],
            "point_used" => ["required", "numeric"],
            "point_earned" => ["required", "numeric"],
            "discount" => ["required", "numeric"],
            "admin_fee" => ["required", "numeric"],
            "total" => ["required", "numeric"],
        ]);
        try {
            DB::transaction(function () use ($validated, $id) {
                $transaction = Transaction::with("items")->findOrFail($id);
                if ($transaction->cashier_id != Auth::user()->id) {
                    return back()->with(
                        "error",
                        "Transaksi ini bukan milik kasir lain",
                    );
                }

                // 1. Revert Old State
                // Revert Stock
                foreach ($transaction->items as $item) {
                    $variant = ProductVariant::find($item->variant_id);
                    if ($variant) {
                        $variant->increment("stock", $item->quantity);
                    }
                }

                // Revert Points
                if ($transaction->customer_id) {
                    $oldCustomer = Customer::find($transaction->customer_id);
                    if ($oldCustomer) {
                        if ($transaction->point_used > 0) {
                            $oldCustomer->increment(
                                "points",
                                $transaction->point_used,
                            );
                        }
                        if ($transaction->point_earned > 0) {
                            $oldCustomer->decrement(
                                "points",
                                $transaction->point_earned,
                            );
                        }
                    }
                }

                // 2. Process New Data
                // Handle Customer
                if (
                    $validated["is_new_customer"] ||
                    (isset($validated["register_customer"]["name"]) &&
                        isset($validated["register_customer"]["phone"]) &&
                        isset($validated["register_customer"]["address"]) &&
                        (empty($validated["register_customer"]["name"]) ||
                            empty($validated["register_customer"]["phone"]) ||
                            empty($validated["register_customer"]["address"])))
                ) {
                    $validated["customer_id"] = null;
                    $validated["customer_type"] = "general";
                }

                if (
                    $validated["is_new_customer"] &&
                    isset($validated["register_customer"]) &&
                    isset($validated["register_customer"]["name"]) &&
                    isset($validated["register_customer"]["phone"]) &&
                    isset($validated["register_customer"]["address"]) &&
                    !empty($validated["register_customer"]["name"]) &&
                    !empty($validated["register_customer"]["phone"]) &&
                    !empty($validated["register_customer"]["address"])
                ) {
                    $customer = Customer::create([
                        "name" => $validated["register_customer"]["name"],
                        "phone" => $validated["register_customer"]["phone"],
                        "address" => $validated["register_customer"]["address"],
                        "type" =>
                            $validated["register_customer"]["type"] ?? "member",
                        "points" => 0,
                    ]);
                    $validated["customer_id"] = $customer->id;
                    $validated["customer_type"] = "member";
                }

                // Validate Items and Stock (Check against current stock which now includes the reverted stock)
                $items = [];
                foreach ($validated["items"] as $item) {
                    $product_variant = ProductVariant::find($item["id"]);
                    if (!$product_variant) {
                        throw new \Exception(
                            "Produk " . $item["sku"] . " tidak ditemukan",
                        );
                    }
                    if ($product_variant->stock < $item["qty"]) {
                        throw new \Exception(
                            "Stok produk " . $item["sku"] . " tidak mencukupi",
                        );
                    }
                    $items[] = $item;
                }

                // Recalculate
                $subtotal = $this->recalculateSubtotal($items);
                $point_earned = $this->recalculatePointEarned($items);
                $point_used = $validated["point_used"];
                $admin_fee = $validated["admin_fee"];
                $discount = $this->discountInDecimal($point_used);
                $total = $this->recalculateTotal(
                    $subtotal,
                    $discount,
                    $admin_fee,
                );

                // 3. Update Transaction
                $transaction->update([
                    "customer_type" => $validated["customer_type"] ?: "general",
                    "customer_id" => $validated["customer_id"] ?: null,
                    "point_earned" => $point_earned,
                    "point_used" => $point_used,
                    "subtotal" => $subtotal,
                    "discount" => $discount,
                    "total" => $total,
                    "payment_method" => $validated["payment_method"],
                    "admin_fee" => $admin_fee,
                ]);

                // Update Items (Delete old, create new)
                $transaction->items()->delete();

                $transaction_items = collect($items)
                    ->map(function ($item) use ($transaction) {
                        return [
                            "transaction_id" => $transaction->id,
                            "variant_id" => $item["id"],
                            "quantity" => $item["qty"],
                            "price_per_item" => $item["price_applied"],
                            "subtotal" => $item["price_applied"] * $item["qty"],
                        ];
                    })
                    ->toArray();
                $transaction->items()->createMany($transaction_items);

                // 4. Apply New State
                // Update Stock
                foreach ($items as $item) {
                    $product_variant = ProductVariant::find($item["id"]);
                    $product_variant->decrement("stock", $item["qty"]);
                }

                // Update Points
                if ($validated["customer_id"]) {
                    $customer = Customer::find($validated["customer_id"]);
                    if ($customer) {
                        if ($point_used > 0) {
                            $customer->decrement("points", $point_used);
                        }
                        if ($point_earned > 0) {
                            $customer->increment("points", $point_earned);
                        }
                    }
                }
            });
        } catch (\Exception $e) {
            return back()->withErrors(["error" => $e->getMessage()]);
        }

        Session::flash("success", "Transaksi berhasil diperbarui");
        return Inertia::location("/cashier/transactions/{$id}");
    }

    public function destroy($id)
    {
        $transaction = Transaction::find($id);
        if (!$transaction) {
            return back()->with("error", "Transaksi tidak ditemukan");
        }
        if ($transaction->cashier_id != Auth::user()->id) {
            return back()->with(
                "error",
                "Transaksi ini bukan milik kasir lain",
            );
        }
        // Revert product variant stock
        $transaction->load("items.variant");
        foreach ($transaction->items as $item) {
            if ($item->variant) {
                $item->variant->increment("stock", $item->quantity);
            }
        }
        // Revert customer points
        if (
            $transaction->customer_id &&
            $transaction->customer_type != "general"
        ) {
            $customer = Customer::find($transaction->customer_id);
            if ($customer) {
                if ($transaction->point_used > 0) {
                    $customer->increment("points", $transaction->point_used);
                }
                if ($transaction->point_earned > 0) {
                    $newPoints = max(
                        0,
                        $customer->points - $transaction->point_earned,
                    );
                    $customer->points = $newPoints;
                    $customer->save();
                }
            }
        }

        $transaction->delete();
        Session::flash("success", "Transaksi berhasil dihapus");
        return Inertia::location("/cashier/transactions/records");
    }

    public function findTrxForPrint($id)
    {
        $transaction = Transaction::with([
            "items.variant.product",
            "customer",
            "cashier",
        ])->find($id);
        $setting = Setting::first();
        return response()->json([
            "transaction" => $transaction,
            "setting" => $setting,
        ]);
    }
}
