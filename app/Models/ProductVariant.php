<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $guarded = ["id"];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function prices()
    {
        return $this->hasMany(ProductVariantPrice::class, "variant_id");
    }

    public function transactionItems()
    {
        return $this->hasMany(TransactionItem::class, "variant_id");
    }

    public function productRejects()
    {
        return $this->hasMany(ProductReject::class, "variant_id");
    }
}
