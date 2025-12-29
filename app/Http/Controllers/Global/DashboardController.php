<?php

namespace App\Http\Controllers\Global;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function adminDashboard()
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        // Summary
        $totalRevenue = Transaction::whereBetween('transaction_time', [$startOfMonth, $endOfMonth])->sum('total');
        $totalTransactions = Transaction::whereBetween('transaction_time', [$startOfMonth, $endOfMonth])->count();
        $totalItemsSold = TransactionItem::whereHas('transaction', function($q) use ($startOfMonth, $endOfMonth) {
            $q->whereBetween('transaction_time', [$startOfMonth, $endOfMonth]);
        })->sum('quantity');
        $totalCustomers = Customer::count();

        // Chart: Sales Trend (Last 7 Days)
        $salesTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $dayStart = $date->copy()->startOfDay();
            $dayEnd = $date->copy()->endOfDay();
            
            $dailyRevenue = Transaction::whereBetween('transaction_time', [$dayStart, $dayEnd])->sum('total');
            $dailyCount = Transaction::whereBetween('transaction_time', [$dayStart, $dayEnd])->count();
            
            $salesTrend[] = [
                'date' => $date->format('d M'),
                'revenue' => $dailyRevenue,
                'count' => $dailyCount
            ];
        }

        // Chart: Sales by Product Type
        $salesByType = TransactionItem::whereHas('transaction', function($q) use ($startOfMonth, $endOfMonth) {
                $q->whereBetween('transaction_time', [$startOfMonth, $endOfMonth]);
            })
            ->join('product_variants', 'transaction_items.variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->select('products.type', DB::raw('sum(transaction_items.subtotal) as total_revenue'))
            ->groupBy('products.type')
            ->get()
            ->map(function($item) {
                return [
                    'type' => $item->type,
                    'total' => $item->total_revenue
                ];
            });

        // Top Products
        $topProducts = TransactionItem::whereHas('transaction', function($q) use ($startOfMonth, $endOfMonth) {
                $q->whereBetween('transaction_time', [$startOfMonth, $endOfMonth]);
            })
            ->join('product_variants', 'transaction_items.variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->select('products.name', DB::raw('sum(transaction_items.quantity) as total_qty'), DB::raw('sum(transaction_items.subtotal) as total_revenue'))
            ->groupBy('products.name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        // Recent Transactions
        $recentTransactions = Transaction::with(['customer', 'cashier'])
            ->latest('transaction_time')
            ->limit(5)
            ->get();

        return Inertia::render("Admin/Dashboard", [
            "title" => "Dashboard",
            "description" => "Ringkasan informasi penjualan dan aktivitas toko",
            "summary" => [
                "revenue" => $totalRevenue,
                "transactions" => $totalTransactions,
                "items_sold" => $totalItemsSold,
                "customers" => $totalCustomers
            ],
            "charts" => [
                "sales_trend" => $salesTrend,
                "sales_by_type" => $salesByType
            ],
            "top_products" => $topProducts,
            "recent_transactions" => $recentTransactions
        ]);
    }

    public function cashierDashboard()
    {
        return Inertia::render("Cashier/Dashboard", [
            "title" => "Dashboard",
            "description" => "Ringkasan informasi penjualan dan aktivitas toko",
        ]);
    }
}
