<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::query()->with(["cashier", "customer"]);
        $setting = Setting::first();

        $startDate = $request->input("start_date");
        $endDate = $request->input("end_date");

        if ($startDate && $endDate) {
            $query->whereBetween("transaction_time", [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ]);
        } else {
            // Default to today
            $startDate = Carbon::now()->format("Y-m-d");
            $endDate = Carbon::now()->format("Y-m-d");

            $query->whereBetween("transaction_time", [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ]);
        }

        // Calculate summary
        // Clone query to avoid modifying the main query for pagination
        $summaryQuery = clone $query;
        $totalRevenue = $summaryQuery->sum("total");
        $totalTransactions = $summaryQuery->count();

        $itemsSoldQuery = clone $query;
        $totalItemsSold = $itemsSoldQuery
            ->join(
                "transaction_items",
                "transactions.id",
                "=",
                "transaction_items.transaction_id",
            )
            ->sum("transaction_items.quantity");

        $transactions = $query
            ->latest("transaction_time")
            ->paginate(10)
            ->withQueryString();

        $adminFeeCriteria = $setting->admin_fee_criteria;
        $availableDebitProviders = [];
        if (\is_array($adminFeeCriteria)) {
            foreach ($adminFeeCriteria as $criteria) {
                if (
                    isset($criteria["payment_method"]) &&
                    $criteria["payment_method"] === "debit" &&
                    isset($criteria["bank_origin"])
                ) {
                    $banks = explode(",", $criteria["bank_origin"]);
                    foreach ($banks as $bank) {
                        $bank = trim($bank);
                        if (
                            $bank !== "" &&
                            !\in_array($bank, $availableDebitProviders)
                        ) {
                            $availableDebitProviders[] = $bank;
                        }
                    }
                }
            }
        }

        $availableDebitProviders = collect($availableDebitProviders);

        return Inertia::render("Admin/Report/Index", [
            "title" => "Laporan Penjualan",
            "description" => "Ringkasan dan detail transaksi penjualan",
            "transactions" => $transactions,
            "summary" => [
                "total_revenue" => $totalRevenue,
                "total_transactions" => $totalTransactions,
                "total_items_sold" => $totalItemsSold,
                "total_revenue_by_payment_method" => [
                    "cash" => (clone $summaryQuery)
                        ->where("payment_method", "cash")
                        ->sum("total"),
                    "debit" => (clone $summaryQuery)
                        ->where("payment_method", "debit")
                        ->sum("total"),
                    "transfer" => (clone $summaryQuery)
                        ->where("payment_method", "transfer")
                        ->sum("total"),
                    "qris" => (clone $summaryQuery)
                        ->where("payment_method", "qris")
                        ->sum("total"),
                ],
            ],
            "available_debit_providers" => $availableDebitProviders->map(
                function ($bank) use ($summaryQuery) {
                    $filteredQuery = clone $summaryQuery;
                    return [
                        "bank_provider" => $bank,
                        "sum_trx" => $filteredQuery
                            ->where("payment_method", "debit")
                            ->where("payment_provider", $bank)
                            ->sum("total"),
                    ];
                },
            ),
            "filters" => [
                "start_date" => $startDate,
                "end_date" => $endDate,
            ],
        ]);
    }

    public function export(Request $request)
    {
        $query = Transaction::query()->with([
            "cashier",
            "customer",
            "items.variant.product",
        ]);
        $setting = Setting::first();

        $startDate = $request->input("start_date");
        $endDate = $request->input("end_date");

        if ($startDate && $endDate) {
            $query->whereBetween("transaction_time", [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ]);
        } else {
            // Default to today
            $startDate = Carbon::now()->format("Y-m-d");
            $endDate = Carbon::now()->format("Y-m-d");
            $query->whereBetween("transaction_time", [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ]);
        }

        $summaryQuery = clone $query;
        $totalRevenue = $summaryQuery->sum("total");
        $totalTransactions = $summaryQuery->count();

        $itemsSoldQuery = clone $query;
        $totalItemsSold = $itemsSoldQuery
            ->join(
                "transaction_items",
                "transactions.id",
                "=",
                "transaction_items.transaction_id",
            )
            ->sum("transaction_items.quantity");

        $adminFeeCriteria = $setting->admin_fee_criteria;
        $availableDebitProviders = [];
        if (\is_array($adminFeeCriteria)) {
            foreach ($adminFeeCriteria as $criteria) {
                if (
                    isset($criteria["payment_method"]) &&
                    $criteria["payment_method"] === "debit" &&
                    isset($criteria["bank_origin"])
                ) {
                    $banks = explode(",", $criteria["bank_origin"]);
                    foreach ($banks as $bank) {
                        $bank = trim($bank);
                        if (
                            $bank !== "" &&
                            !\in_array($bank, $availableDebitProviders)
                        ) {
                            $availableDebitProviders[] = $bank;
                        }
                    }
                }
            }
        }

        $availableDebitProviders = collect($availableDebitProviders);

        $transactions = $query->latest("transaction_time")->get();

        return Inertia::render("Admin/Report/Export", [
            "title" => "Laporan Penjualan",
            "transactions" => $transactions,
            "summary" => [
                "total_revenue" => $totalRevenue,
                "total_transactions" => $totalTransactions,
                "total_items_sold" => $totalItemsSold,
                "total_revenue_by_payment_method" => [
                    "cash" => (clone $summaryQuery)
                        ->where("payment_method", "cash")
                        ->sum("total"),
                    "debit" => (clone $summaryQuery)
                        ->where("payment_method", "debit")
                        ->sum("total"),
                    "transfer" => (clone $summaryQuery)
                        ->where("payment_method", "transfer")
                        ->sum("total"),
                    "qris" => (clone $summaryQuery)
                        ->where("payment_method", "qris")
                        ->sum("total"),
                ],
            ],
            "available_debit_providers" => $availableDebitProviders->map(
                function ($bank) use ($summaryQuery) {
                    $filteredQuery = clone $summaryQuery;
                    return [
                        "bank_provider" => $bank,
                        "sum_trx" => $filteredQuery
                            ->where("payment_method", "debit")
                            ->where("payment_provider", $bank)
                            ->sum("total"),
                    ];
                },
            ),
            "filters" => [
                "start_date" => $startDate,
                "end_date" => $endDate,
            ],
            "print_date" => Carbon::now()->format("d M Y H:i"),
        ]);
    }
}
