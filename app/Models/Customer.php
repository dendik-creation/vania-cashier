<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    // Type constants
    const TYPE_MEMBER = "member";
    const TYPE_RESELLER = "reseller";
    const EACH_POINT_VALUE = 2500; // in IDR

    protected $guarded = ["id"];
    protected $hidden = ["created_at", "updated_at"];

    // Relationships
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
