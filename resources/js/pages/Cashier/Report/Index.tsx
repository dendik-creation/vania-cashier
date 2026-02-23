import AppLayout from "@/partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/partials/PageTitle";
import React, { useEffect, useRef } from "react";
import { useForm, router, Link } from "@inertiajs/react";
import {
    DatePickerInput,
    PaginatorBuilder,
} from "@/components/custom/FormElement";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Printer,
    Banknote,
    ShoppingCart,
    Package,
    Users,
    CreditCard,
    Calendar as CalendarIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/types/transaction";
import { PaginationData } from "@/types/global";
import {
    floatToIdCurrency,
    ymdToIdDate,
    humanCustType,
    humanPaymentMethod,
} from "@/components/helper/helper";
import EmptyCard from "@/components/custom/EmptyCard";

type PageProps = PageTitleProps & {
    transactions: PaginationData<Transaction>;
    summary: {
        total_revenue: number;
        total_transactions: number;
        total_items_sold: number;
        total_revenue_by_payment_method: {
            cash: number;
            debit: number;
            transfer: number;
            qris: number;
        };
    };
    available_debit_providers: {
        bank_provider: string;
        sum_trx: number;
    }[];
    filters: {
        start_date: string;
        end_date: string;
    };
};

const CashierReportIndex = ({
    title,
    description,
    transactions,
    summary,
    available_debit_providers,
    filters,
}: PageProps) => {
    const firstRender = useRef(true);
    const { data, setData } = useForm({
        start_date: filters.start_date,
        end_date: filters.end_date,
    });

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        router.get(
            "/cashier/reports",
            {
                start_date: data.start_date,
                end_date: data.end_date,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
                only: ["transactions", "summary", "filters"],
            },
        );
    }, [data.start_date, data.end_date]);

    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                <Card className="bg-primary/5 border-primary/20 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Pendapatan
                            </p>
                            <h3 className="text-2xl font-bold text-primary">
                                {floatToIdCurrency(summary.total_revenue)}
                            </h3>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <Banknote size={24} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Transaksi
                            </p>
                            <h3 className="text-2xl font-bold text-blue-700">
                                {summary.total_transactions}
                            </h3>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-full text-blue-700">
                            <ShoppingCart size={24} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Item Terjual
                            </p>
                            <h3 className="text-2xl font-bold text-green-700">
                                {summary.total_items_sold}
                            </h3>
                        </div>
                        <div className="p-2 bg-green-100 rounded-full text-green-700">
                            <Package size={24} />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
                <Card className="bg-primary/5 border-primary/20 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Pendapatan dari Tunai
                            </p>
                            <h3 className="text-2xl font-bold text-primary">
                                {floatToIdCurrency(
                                    summary.total_revenue_by_payment_method
                                        .cash,
                                )}
                            </h3>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <Banknote size={24} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Pendapatan dari Transfer
                            </p>
                            <h3 className="text-2xl font-bold text-blue-700">
                                {floatToIdCurrency(
                                    summary.total_revenue_by_payment_method
                                        .transfer,
                                )}
                            </h3>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-full text-blue-700">
                            <Banknote size={24} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Pendapatan dari QRIS
                            </p>
                            <h3 className="text-2xl font-bold text-green-700">
                                {floatToIdCurrency(
                                    summary.total_revenue_by_payment_method
                                        .qris,
                                )}
                            </h3>
                        </div>
                        <div className="p-2 bg-green-100 rounded-full text-green-700">
                            <Banknote size={24} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-50 border-yellow-200 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Pendapatan Debit
                            </p>
                            <h3 className="text-2xl font-bold text-yellow-700">
                                {floatToIdCurrency(
                                    summary.total_revenue_by_payment_method
                                        .debit,
                                )}
                            </h3>
                        </div>
                        <div className="p-2 bg-yellow-100 rounded-full text-yellow-700">
                            <Banknote size={24} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {available_debit_providers &&
                available_debit_providers.length > 0 && (
                    <div
                        className="flex gap-3 mb-4 w-full overflow-x-auto"
                        style={{ WebkitOverflowScrolling: "touch" }}
                    >
                        {available_debit_providers.map((provider) => (
                            <div
                                key={provider.bank_provider}
                                className="shrink-0"
                                style={{
                                    minWidth: 220,
                                    maxWidth: 320,
                                    width: "100%",
                                }}
                            >
                                <Card className="border-gray-200 shadow-sm p-2 h-full">
                                    <CardContent className="p-2 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Pendapatan Debit{" "}
                                                {provider.bank_provider}
                                            </p>
                                            <h3 className="text-lg font-bold text-gray-700">
                                                {floatToIdCurrency(
                                                    provider.sum_trx,
                                                )}
                                            </h3>
                                        </div>
                                        <div className="p-1 bg-gray-100 rounded-full text-gray-700">
                                            <Banknote size={16} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}

            {/* Filters and Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
                <div className="w-full md:w-auto flex-1 max-w-md">
                    <DatePickerInput
                        mode="range"
                        placeholder="Pilih Rentang Tanggal"
                        value={
                            data.start_date && data.end_date
                                ? {
                                      from: new Date(data.start_date),
                                      to: new Date(data.end_date),
                                  }
                                : undefined
                        }
                        onChange={(dateRange) => {
                            if (dateRange) {
                                const [start, end] = dateRange.split(" - ");
                                setData((prev) => ({
                                    ...prev,
                                    start_date: start,
                                    end_date: end,
                                }));
                            } else {
                                setData((prev) => ({
                                    ...prev,
                                    start_date: "",
                                    end_date: "",
                                }));
                            }
                        }}
                    />
                </div>

                <Link
                    href={`/cashier/reports/export?start_date=${data.start_date}&end_date=${data.end_date}`}
                    target="_blank"
                >
                    <Button variant="outline" className="w-full md:w-auto">
                        <Printer className="mr-2 h-4 w-4" />
                        Cetak Laporan
                    </Button>
                </Link>
            </div>

            {/* Transactions List */}
            {transactions.data.length === 0 ? (
                <EmptyCard message="Tidak ada data transaksi pada periode ini." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {transactions.data.map((trx, index) => (
                        <Card
                            key={trx.id}
                            tabIndex={index}
                            className="relative py-3 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <CardContent className="px-3">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-semibold text-sm">
                                            {trx.invoice_code}
                                        </h4>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                            <CalendarIcon size={12} />
                                            {ymdToIdDate(
                                                trx.transaction_time,
                                                true,
                                            )}
                                        </div>
                                    </div>
                                    <Badge
                                        variant={
                                            trx.payment_method === "cash"
                                                ? "default"
                                                : "secondary"
                                        }
                                        className="capitalize"
                                    >
                                        {humanPaymentMethod(trx.payment_method)}{" "}
                                        {trx.payment_provider
                                            ? `${trx.payment_provider}`
                                            : ""}
                                    </Badge>
                                </div>

                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users size={14} />
                                        <span className="truncate">
                                            {trx.customer
                                                ? trx.customer.name
                                                : "Umum"}
                                            <span className="text-xs ml-1 bg-slate-100 px-1.5 py-0.5 rounded-full">
                                                {humanCustType(
                                                    trx.customer_type,
                                                )}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CreditCard size={14} />
                                        <span>{trx.cashier?.name}</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">
                                        Total
                                    </span>
                                    <span className="font-bold text-lg text-primary">
                                        {floatToIdCurrency(trx.total)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="flex flex-col lg:flex-row justify-between items-center mt-3">
                <p className="text-sm w-full">
                    Total {transactions.total} Transaksi
                </p>
                {transactions.total > transactions.per_page && (
                    <PaginatorBuilder
                        prevUrl={transactions.prev_page_url || ""}
                        nextUrl={transactions.next_page_url || ""}
                        currentPage={transactions.current_page}
                        totalPage={transactions.last_page}
                    />
                )}
            </div>
        </AppLayout>
    );
};

export default CashierReportIndex;
