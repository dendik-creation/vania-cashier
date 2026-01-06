<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;
    protected $guarded = ["id"];

    protected $casts = [
        "type" => "string",
        "with_price_criteria" => "boolean",
    ];

    protected $hidden = ["created_at", "updated_at"];

    // Relationships
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }
}
