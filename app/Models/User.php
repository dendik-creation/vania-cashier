<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    // Role constants
    const ROLE_ADMIN = "admin";
    const ROLE_CASHIER = "cashier";

    protected $guarded = ["id"];

    protected $hidden = ["password"];

    protected function casts(): array
    {
        return [
            "password" => "hashed",
            "joined_at" => "datetime",
        ];
    }

    // Relationships
    public function transactions()
    {
        return $this->hasMany(Transaction::class, "cashier_id");
    }
}
