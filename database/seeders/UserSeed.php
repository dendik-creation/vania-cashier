<?php

namespace Database\Seeders;

use App\Models\User;
use Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

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
