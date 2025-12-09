<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    // Type constants
    const TYPE_MEMBER = "member";
    const TYPE_RESELLER = "reseller";

    protected $guarded = ["id"];

    // Relationships
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
