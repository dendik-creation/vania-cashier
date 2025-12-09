<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductReject extends Model
{
    // Status constants
    const STATUS_PENDING = "pending";
    const STATUS_DONE = "done";

    protected $guarded = ["id"];

    protected function casts(): array
    {
        return [
            "rejected_at" => "datetime",
        ];
    }

    // Relationships
    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, "variant_id");
    }
}
