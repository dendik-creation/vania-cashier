<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    // Customer type constants
    const CUSTOMER_TYPE_GENERAL = "general";
    const CUSTOMER_TYPE_MEMBER = "member";
    const CUSTOMER_TYPE_RESELLER = "reseller";

    // Payment method constants
    const PAYMENT_METHOD_CASH = "cash";
    const PAYMENT_METHOD_QRIS = "qris";
    const PAYMENT_METHOD_TRANSFER = "transfer";

    protected $guarded = ["id"];

    protected function casts(): array
    {
        return [
            "transaction_time" => "datetime",
        ];
    }

    // Relationships
    public function cashier()
    {
        return $this->belongsTo(User::class, "cashier_id")->withTrashed();
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class)->withTrashed();
    }

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }
}
