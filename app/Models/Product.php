<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ["name", "type", "brand"];

    protected $casts = [
        "type" => "string",
    ];

    protected $hidden = ["created_at", "updated_at"];

    // Relationships
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }
}
