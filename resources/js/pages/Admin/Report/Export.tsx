import React, { useEffect } from "react";
import { Head } from "@inertiajs/react";
import {
    floatToIdCurrency,
    humanCustType,
    humanPaymentMethod,
    ymdToIdDate,
} from "@/components/helper/helper";

type Transaction = {
    id: number;
    invoice_code: string;
    customer_type: string;
    customer?: { name: string };
    cashier: { name: string };
    total: number;
    payment_method: string;
    payment_provider: string;
    transaction_time: string;
    items: {
        id: number;
        variant: {
            product: { name: string };
            color: string;
            size: string;
        };
        quantity: number;
        subtotal: number;
    }[];
};

type ExportProps = {
    title: string;
    transactions: Transaction[];
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
    print_date: string;
};

const AdminReportExport = ({
    title,
    transactions,
    summary,
    available_debit_providers,
    filters,
    print_date,
}: ExportProps) => {
    useEffect(() => {
        if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {
            (function () {
                const realPrintFunc = window.print;
                const interval = 1000;
                let nextAvailableTime = +new Date();

                window.print = function () {
                    const now = +new Date();
                    if (now > nextAvailableTime) {
                        realPrintFunc();
                        nextAvailableTime = now + interval;
                    } else {
                        setTimeout(realPrintFunc, nextAvailableTime - now);
                        nextAvailableTime += interval;
                    }
                };
            })();
        }

        let printStartTime: number;
        let isProcessingPrint = false;
        let hasNavigatedBack = false;

        const handleBeforePrint = () => {
            printStartTime = Date.now();
            isProcessingPrint = true;
        };

        const handleAfterPrint = () => {
            isProcessingPrint = false;

            if (hasNavigatedBack) return;
            hasNavigatedBack = true;

            window.close();
        };

        const triggerPrint = () => {
            if (isProcessingPrint) return;
            if (document.hidden) return;

            window.print();
        };

        window.addEventListener("beforeprint", handleBeforePrint);
        window.addEventListener("afterprint", handleAfterPrint);

        const printTimeout = setTimeout(() => {
            triggerPrint();
        }, 100);

        return () => {
            clearTimeout(printTimeout);
            window.removeEventListener("beforeprint", handleBeforePrint);
            window.removeEventListener("afterprint", handleAfterPrint);
        };
    }, []);

    return (
        <div className="p-8 bg-white min-h-screen text-black font-sans">
            <Head title={title} />

            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold uppercase mb-2">{title}</h1>
                <p className="text-sm text-gray-600">
                    Periode: {ymdToIdDate(filters.start_date)} -{" "}
                    {ymdToIdDate(filters.end_date)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    Dicetak pada: {ymdToIdDate(print_date, true)}
                </p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-8 border border-gray-300 p-4 rounded-lg">
                <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">
                        Total Pendapatan
                    </div>
                    <div className="text-xl font-bold">
                        {floatToIdCurrency(summary.total_revenue)}
                    </div>
                </div>
                <div className="text-center border-l border-gray-300">
                    <div className="text-sm text-gray-500 mb-1">
                        Total Transaksi
                    </div>
                    <div className="text-xl font-bold">
                        {summary.total_transactions}
                    </div>
                </div>
                <div className="text-center border-l border-gray-300">
                    <div className="text-sm text-gray-500 mb-1">
                        Item Terjual
                    </div>
                    <div className="text-xl font-bold">
                        {summary.total_items_sold}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8 border border-gray-300 p-4 rounded-lg">
                <div className="text-center">
                    <div className="text-sm text-center text-gray-500 mb-1">
                        Pendapatan dari Tunai
                    </div>
                    <div className="text-xl font-bold">
                        {floatToIdCurrency(
                            summary.total_revenue_by_payment_method.cash,
                        )}
                    </div>
                </div>
                <div className="text-center border-l border-gray-300">
                    <div className="text-sm text-center text-gray-500 mb-1">
                        Pendapatan dari Transfer
                    </div>
                    <div className="text-xl font-bold">
                        {floatToIdCurrency(
                            summary.total_revenue_by_payment_method.transfer,
                        )}
                    </div>
                </div>
                <div className="text-center border-l border-gray-300">
                    <div className="text-sm text-center text-gray-500 mb-1">
                        Pendapatan dari QRIS
                    </div>
                    <div className="text-xl font-bold">
                        {floatToIdCurrency(
                            summary.total_revenue_by_payment_method.qris,
                        )}
                    </div>
                </div>
                <div className="text-center border-l border-gray-300">
                    <div className="text-sm text-center text-gray-500 mb-1">
                        Total Pendapatan Debit
                    </div>
                    <div className="text-xl font-bold">
                        {floatToIdCurrency(
                            summary.total_revenue_by_payment_method.debit,
                        )}
                    </div>
                </div>
            </div>

            {available_debit_providers &&
                available_debit_providers.length > 0 && (
                    <div
                        className="flex gap-3 mb-4 w-full justify-center items-center overflow-x-auto"
                        style={{ WebkitOverflowScrolling: "touch" }}
                    >
                        {available_debit_providers.map((provider) => (
                            <div
                                key={provider.bank_provider}
                                className="text-center border-l border-gray-300 flex-1 min-w-[120px] max-w-40 px-2"
                                style={{
                                    fontSize: "0.85rem",
                                }}
                            >
                                <div className="text-xs text-center text-gray-500 mb-0.5">
                                    Pendapatan Debit {provider.bank_provider}
                                </div>
                                <div className="text-base font-bold">
                                    {floatToIdCurrency(provider.sum_trx)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            {/* Table */}
            <table className="w-full text-sm border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-center w-12">
                            No
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                            Invoice
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                            Waktu
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                            Pelanggan
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                            Item
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                            Metode Bayar
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                            Total
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((t, i) => (
                        <tr key={t.id}>
                            <td className="border border-gray-300 p-2 text-center align-top">
                                {i + 1}
                            </td>
                            <td className="border border-gray-300 p-2 align-top">
                                {t.invoice_code}
                            </td>
                            <td className="border border-gray-300 p-2 align-top">
                                {ymdToIdDate(t.transaction_time, true)}
                            </td>
                            <td className="border border-gray-300 p-2 align-top">
                                <div>
                                    {t.customer ? t.customer.name : "Umum"}
                                </div>
                                {t.customer != null && (
                                    <div className="text-xs text-gray-500 capitalize">
                                        {humanCustType(t.customer_type)}
                                    </div>
                                )}
                            </td>
                            <td className="border border-gray-300 p-2 align-top">
                                <ul className="list-disc list-inside text-xs">
                                    {t.items.map((item) => (
                                        <li key={item.id}>
                                            {item.variant.product.name} (
                                            {item.quantity}x)
                                        </li>
                                    ))}
                                </ul>
                            </td>
                            <td className="border border-gray-300 p-2 text-center align-top">
                                {humanPaymentMethod(t.payment_method)}{" "}
                                {t.payment_provider
                                    ? `${t.payment_provider}`
                                    : ""}
                            </td>
                            <td className="border border-gray-300 p-2 text-center align-top">
                                {floatToIdCurrency(t.total)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminReportExport;
