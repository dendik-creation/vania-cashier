<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use SoftDeletes;
    protected $fillable = [
        "product_id",
        "sku",
        "attributes",
        "price_criteria",
        "stock",
    ];

    protected $casts = [
        "attributes" => "array", // JSON: {"size": 41, "color": "red"}
        "price_criteria" => "array", // JSON: {"basic": 100000, "reseller": 90000, "order_qty_3": 85000, "order_qty_6": 80000}
        "stock" => "integer",
    ];

    protected $hidden = ["created_at", "updated_at"];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function transactionItems()
    {
        return $this->hasMany(TransactionItem::class, "variant_id");
    }

    public function productRejects()
    {
        return $this->hasMany(ProductReject::class, "variant_id");
    }

    // Helper methods
    public function getAttribute($key)
    {
        $value = parent::getAttribute($key);

        // Ensure attributes is always an array
        if ($key === "attributes" && is_string($value)) {
            return json_decode($value, true) ?? [];
        }

        return $value;
    }
}
