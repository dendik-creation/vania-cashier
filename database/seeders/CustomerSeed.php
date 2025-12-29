<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeed extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample Member Customers
        Customer::create([
            'name' => 'Budi Santoso',
            'phone' => '081234567890',
            'address' => 'Jl. Sudirman No. 45, Jakarta',
            'type' => Customer::TYPE_MEMBER,
            'points' => 25,
            'joined_at' => now()->subMonths(6),
        ]);

        // Sample Reseller Customers
        Customer::create([
            'name' => 'Bakul Reseller',
            'phone' => '081234567893',
            'address' => 'Jl. Raya Bekasi No. 100, Bekasi',
            'type' => Customer::TYPE_RESELLER,
            'points' => 120,
            'joined_at' => now()->subYears(2),
        ]);
    }
}
