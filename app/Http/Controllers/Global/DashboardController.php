<?php

namespace App\Http\Controllers\Global;

use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Customer;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Models\TransactionItem;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

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
        $cashierId = Auth::id();
        $today = Carbon::today();
        
        // 1. Summary Cards (Fokus Hari Ini)
        $todayTransactions = Transaction::where('cashier_id', $cashierId)
            ->whereDate('transaction_time', $today);

        $summary = [
            'revenue_today' => $todayTransactions->sum('total'),
            'transaction_count' => $todayTransactions->count(),
            // Hitung item terjual hari ini oleh kasir ini
            'items_sold' => TransactionItem::whereHas('transaction', function($q) use ($cashierId, $today) {
                $q->where('cashier_id', $cashierId)
                  ->whereDate('transaction_time', $today);
            })->sum('quantity'),
        ];

        // 2. Chart: Hourly Sales Trend (Tren Penjualan Per Jam Hari Ini)
        $hourlyTrend = [];
        for ($i = 0; $i <= 23; $i++) {
            $startTime = $today->copy()->setTime($i, 0, 0);
            $endTime = $today->copy()->setTime($i, 59, 59);

            $hourRevenue = Transaction::where('cashier_id', $cashierId)
                ->whereBetween('transaction_time', [$startTime, $endTime])
                ->sum('total');
            
            $hourCount = Transaction::where('cashier_id', $cashierId)
                ->whereBetween('transaction_time', [$startTime, $endTime])
                ->count();

             $hourlyTrend[] = [
                'hour' => $startTime->format('H:00'),
                'revenue' => $hourRevenue,
                'count' => $hourCount
            ];
        }

        // 3. Chart: Payment Method Distribution (Metode Pembayaran)
        $paymentMethods = Transaction::where('cashier_id', $cashierId)
            ->whereDate('transaction_time', $today)
            ->select('payment_method', DB::raw('count(*) as total_trx'), DB::raw('sum(total) as total_amount'))
            ->groupBy('payment_method')
            ->get()
            ->map(function($item) {
                return [
                    'method' => strtoupper($item->payment_method),
                    'total_trx' => $item->total_trx,
                    'total_amount' => $item->total_amount
                ];
            });

        // 4. Recent Transactions (Transaksi Terakhir Kasir Ini)
        $recentTransactions = Transaction::with(['customer'])
            ->where('cashier_id', $cashierId)
            ->whereDate('transaction_time', $today)
            ->latest('transaction_time')
            ->limit(5)
            ->get();

        return Inertia::render("Cashier/Dashboard", [
            "title" => "Dashboard Kasir",
            "description" => "Ringkasan penjualan Anda hari ini (" . $today->translatedFormat('d F Y') . ")",
            "summary" => $summary,
            "charts" => [
                "hourly_trend" => $hourlyTrend,
                "payment_methods" => $paymentMethods
            ],
            "recent_transactions" => $recentTransactions
        ]);
    }
}
