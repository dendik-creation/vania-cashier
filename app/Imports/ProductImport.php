<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;

class ProductImport implements ToCollection
{
    public function collection(Collection $rows)
    {
        DB::transaction(function () use ($rows) {
            $currentProduct = null;
            $expectingProductData = false;
            $variantHeaderMap = [];
            $collected_product_types = []; // as string[]

            foreach ($rows as $row) {
                $rowArray = $row->toArray();
                $firstCell = isset($rowArray[0])
                    ? trim((string) $rowArray[0])
                    : "";

                if (strcasecmp($firstCell, "Nama Produk") === 0) {
                    $expectingProductData = true;
                    $currentProduct = null;
                    $variantHeaderMap = [];
                    continue;
                }

                if ($expectingProductData) {
                    if ($firstCell === "") {
                        continue;
                    }

                    $name = $firstCell;
                    $type = isset($rowArray[1])
                        ? trim((string) $rowArray[1])
                        : "";
                    $brand = isset($rowArray[2])
                        ? trim((string) $rowArray[2])
                        : null;
                    $with_price_criteria =
                        !isset($rowArray[3]) ||
                        strtolower(trim((string) $rowArray[3])) !== "tidak";
                    $can_earn_point =
                        !isset($rowArray[4]) ||
                        strtolower(trim((string) $rowArray[4])) !== "tidak";

                    $currentProduct = Product::firstOrCreate(
                        ["name" => $name],
                        [
                            "type" => $type,
                            "brand" => $brand,
                            "with_price_criteria" => $with_price_criteria,
                            "can_earn_point" => $can_earn_point,
                        ],
                    );

                    $expectingProductData = false;
                    continue;
                }

                if (strcasecmp($firstCell, "sku") === 0) {
                    // example: [0 => 'sku', 1 => 'color', 2 => 'size', ...]
                    $variantHeaderMap = array_map(function ($val) {
                        return strtolower(trim((string) $val));
                    }, $rowArray);
                    continue;
                }

                if ($currentProduct && $firstCell !== "") {
                    $sku = $firstCell;

                    if (ProductVariant::where("sku", $sku)->exists()) {
                        continue;
                    }

                    $color = $this->getValue(
                        $rowArray,
                        $variantHeaderMap,
                        "color",
                    );
                    $size = $this->getValue(
                        $rowArray,
                        $variantHeaderMap,
                        "size",
                    );

                    $priceBasic = $this->getValue(
                        $rowArray,
                        $variantHeaderMap,
                        "harga_normal",
                    );
                    if ($currentProduct->with_price_criteria) {
                        $priceReseller = $this->getValue(
                            $rowArray,
                            $variantHeaderMap,
                            "harga_reseller",
                        );
                        $priceQty3 = $this->getValue(
                            $rowArray,
                            $variantHeaderMap,
                            "harga_3qty",
                        );
                        $priceQty6 = $this->getValue(
                            $rowArray,
                            $variantHeaderMap,
                            "harga_6qty",
                        );
                    } else {
                        $priceReseller = 0;
                        $priceQty3 = 0;
                        $priceQty6 = 0;
                    }

                    $stock =
                        $this->getValue($rowArray, $variantHeaderMap, "stok") ??
                        0;

                    ProductVariant::create([
                        "product_id" => $currentProduct->id,
                        "sku" => $sku,
                        "attributes" => [
                            "color" => $color,
                            "size" => $size,
                        ],
                        "price_criteria" => [
                            "basic" => (int) $priceBasic,
                            "reseller" => (int) $priceReseller,
                            "order_qty_3" => (int) $priceQty3,
                            "order_qty_6" => (int) $priceQty6,
                        ],
                        "stock" => (int) $stock,
                    ]);
                }
                // Simpan nilai type yang unik saja
                if ($type) {
                    $typeLower = strtolower($type);
                    if (!in_array($typeLower, $collected_product_types)) {
                        $collected_product_types[] = $typeLower;
                    }
                }
            }

            // Update product types list in setting
            $setting = Setting::first();
            $existingTypes = $setting->product_types ?? [];
            $existingTypesLower = array_map("strtolower", $existingTypes);

            foreach ($collected_product_types as $type) {
                if (!in_array($type, $existingTypesLower)) {
                    $existingTypes[] = $type;
                    $existingTypesLower[] = $type;
                }
            }

            $setting->update([
                "product_types" => $existingTypes,
            ]);
        });
    }

    private function getValue($row, $map, $key)
    {
        $index = array_search(strtolower($key), $map);

        if ($index !== false && isset($row[$index])) {
            return $row[$index];
        }

        return null;
    }
}
