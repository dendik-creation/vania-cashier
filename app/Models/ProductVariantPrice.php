<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariantPrice extends Model
{
    // Customer type constants
    const CUSTOMER_TYPE_GENERAL = "general";
    const CUSTOMER_TYPE_MEMBER = "member";
    const CUSTOMER_TYPE_RESELLER = "reseller";

    protected $guarded = ["id"];

    // Relationships
    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, "variant_id");
    }
}
