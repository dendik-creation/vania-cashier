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

        Customer::create([
            'name' => 'Siti Nurhaliza',
            'phone' => '081234567891',
            'address' => 'Jl. Gatot Subroto No. 12, Jakarta',
            'type' => Customer::TYPE_MEMBER,
            'points' => 15,
            'joined_at' => now()->subMonths(3),
        ]);

        Customer::create([
            'name' => 'Ahmad Yani',
            'phone' => '081234567892',
            'address' => 'Jl. Thamrin No. 78, Jakarta',
            'type' => Customer::TYPE_MEMBER,
            'points' => 42,
            'joined_at' => now()->subYear(),
        ]);

        // Sample Reseller Customers
        Customer::create([
            'name' => 'Toko Sepatu Jaya',
            'phone' => '081234567893',
            'address' => 'Jl. Raya Bekasi No. 100, Bekasi',
            'type' => Customer::TYPE_RESELLER,
            'points' => 120,
            'joined_at' => now()->subYears(2),
        ]);

        Customer::create([
            'name' => 'Toko Tas Indah',
            'phone' => '081234567894',
            'address' => 'Jl. Raya Bogor No. 55, Bogor',
            'type' => Customer::TYPE_RESELLER,
            'points' => 87,
            'joined_at' => now()->subMonths(8),
        ]);

        // Sample with high points (can use discount)
        Customer::create([
            'name' => 'Dewi Lestari',
            'phone' => '081234567895',
            'address' => 'Jl. Kebon Jeruk No. 23, Jakarta Barat',
            'type' => Customer::TYPE_MEMBER,
            'points' => 55,
            'joined_at' => now()->subMonths(10),
        ]);

        // Sample new member with few points
        Customer::create([
            'name' => 'Rudi Hartono',
            'phone' => '081234567896',
            'address' => 'Jl. Cempaka Putih No. 9, Jakarta Pusat',
            'type' => Customer::TYPE_MEMBER,
            'points' => 3,
            'joined_at' => now()->subWeeks(2),
        ]);

        // Sample reseller with very high points
        Customer::create([
            'name' => 'CV Maju Bersama',
            'phone' => '081234567897',
            'address' => 'Jl. Industri No. 45, Tangerang',
            'type' => Customer::TYPE_RESELLER,
            'points' => 250,
            'joined_at' => now()->subYears(3),
        ]);
    }
}
