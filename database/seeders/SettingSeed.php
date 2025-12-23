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
            "app_name" => "Toko Sepatu & Tas Vania",
            "app_logo" => null,
            "app_address" => "Jl. Raya Contoh No. 123, Jakarta Selatan",
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
            "eligible_point_minimum" => 50000,
        ]);
    }
}
