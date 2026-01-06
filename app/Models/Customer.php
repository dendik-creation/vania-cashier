<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;
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
