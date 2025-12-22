<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeed extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            "username" => "akmal",
            "name" => "Aku Akmal",
            "role" => "admin",
            "password" => Hash::make("12345"),
        ]);
        User::create([
            "username" => "zidan",
            "name" => "Aku Zidan",
            "role" => "cashier",
            "password" => Hash::make("12345"),
        ]);
    }
}
