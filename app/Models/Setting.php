<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $guarded = ["id"];
    protected $casts = [
        "admin_fee_criteria" => "array", // JSON: [[ "payment_method" => "qris | cash | transfer", "min_total" => 100_000, "admin_fee" => 1_000 ], [ ... ] ]
        "product_types" => "array", // JSON: [ "tas", "sepatu", "aksesoris"]
    ];
}
