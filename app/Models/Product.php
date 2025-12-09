<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    // Type constants
    const TYPE_SHOES = "shoes";
    const TYPE_BAG = "bag";
    const TYPE_ACCESSORY = "accessory";

    protected $guarded = ["id"];

    // Relationships
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }
}
