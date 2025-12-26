<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::query()->with(['cashier', 'customer']);

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if ($startDate && $endDate) {
            $query->whereBetween('transaction_time', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);
        } else {
            // Default to current month
            $startDate = Carbon::now()->startOfMonth()->format('Y-m-d');
            $endDate = Carbon::now()->endOfMonth()->format('Y-m-d');
            
            $query->whereBetween('transaction_time', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);
        }

        // Calculate summary
        // Clone query to avoid modifying the main query for pagination
        $summaryQuery = clone $query;
        $totalRevenue = $summaryQuery->sum('total');
        $totalTransactions = $summaryQuery->count();
        
        $itemsSoldQuery = clone $query;
        $totalItemsSold = $itemsSoldQuery
            ->join('transaction_items', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->sum('transaction_items.quantity');

        $transactions = $query->latest('transaction_time')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Report/Index', [
            'title' => 'Laporan Penjualan',
            'description' => 'Ringkasan dan detail transaksi penjualan',
            'transactions' => $transactions,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_transactions' => $totalTransactions,
                'total_items_sold' => $totalItemsSold,
            ],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function export(Request $request)
    {
        $query = Transaction::query()->with(['cashier', 'customer', 'items.variant.product']);

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if ($startDate && $endDate) {
            $query->whereBetween('transaction_time', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);
        } else {
            $startDate = Carbon::now()->startOfMonth()->format('Y-m-d');
            $endDate = Carbon::now()->endOfMonth()->format('Y-m-d');
            
            $query->whereBetween('transaction_time', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);
        }

        $summaryQuery = clone $query;
        $totalRevenue = $summaryQuery->sum('total');
        $totalTransactions = $summaryQuery->count();
        
        $itemsSoldQuery = clone $query;
        $totalItemsSold = $itemsSoldQuery
            ->join('transaction_items', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->sum('transaction_items.quantity');

        $transactions = $query->latest('transaction_time')->get();

        return Inertia::render('Admin/Report/Export', [
            'title' => 'Laporan Penjualan',
            'transactions' => $transactions,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_transactions' => $totalTransactions,
                'total_items_sold' => $totalItemsSold,
            ],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'print_date' => Carbon::now()->format('d M Y H:i'),
        ]);
    }
}
