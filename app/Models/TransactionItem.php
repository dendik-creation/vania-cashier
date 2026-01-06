<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionItem extends Model
{
    protected $guarded = ["id"];

    // Relationships
    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function variant()
    {
        return $this->belongsTo(
            ProductVariant::class,
            "variant_id",
        )->withTrashed();
    }
}
