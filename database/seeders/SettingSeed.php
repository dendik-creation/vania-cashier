<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeed extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Setting::create([
            "app_name" => "Kasir Vania Shop",
            "app_logo" => "/icon.png",
            "app_address" => "Jl. Raya Kudus - Colo Panjang, Bae, Kudus",
            "idr_point_value" => 2500,
            "minimum_point_can_used" => 10,
            "eligible_point_minimum" => 50000,
            "admin_fee_criteria" => [
                [
                    "payment_method" => "qris",
                    "min_total" => 100000,
                    "admin_fee" => 1000,
                ],
                [
                    "payment_method" => "qris",
                    "min_total" => 300000,
                    "admin_fee" => 2000,
                ],
            ],
        ]);
    }
}
