import {
    DatePickerInput,
    PaginatorBuilder,
    SearchInput,
    SelectSearchInput,
} from "@/components/custom/FormElement";
import {
    floatToIdCurrency,
    humanCustType,
    humanPaymentMethod,
    inputDebounce,
    ymdToIdDate,
} from "@/components/helper/helper";
import { Button } from "@/components/ui/button";
import AppLayout, { useInertiaShared } from "@/partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/partials/PageTitle";
import { PaginationData } from "@/types/global";
import { Transaction } from "@/types/transaction";
import { Link, router, useForm } from "@inertiajs/react";
import {
    BanknoteArrowUp,
    CircleFadingPlus,
    Clock9,
    Edit,
    Eye,
    Package,
    ReceiptText,
    Trash2,
    Users,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import EmptyCard from "@/components/custom/EmptyCard";
import { Badge } from "@/components/ui/badge";
import ConfirmDialog from "@/components/custom/ConfirmDialog";
import axios from "axios";
import { ReceiptPrinter } from "@/utils/printer";
import BlastToaster from "@/components/custom/BlastToaster";
type PageProps = PageTitleProps & {
    transactions: PaginationData<Transaction>;
    filters: {
        search: string;
        customer_type: string;
        payment_method: string;
        start_date: string;
        end_date: string;
    };
};
const customerTypeOptions = [
    {
        label: "Umum",
        value: "general",
    },
    {
        label: "Member",
        value: "member",
    },
    {
        label: "Reseller",
        value: "reseller",
    },
];
const paymentMethodOptions = [
    {
        label: "Tunai",
        value: "cash",
    },
    {
        label: "QRIS",
        value: "qris",
    },
    {
        label: "Transfer",
        value: "transfer",
    },
];

const CashierTransactionIndex = ({
    title,
    description,
    transactions,
    filters,
}: PageProps) => {
    const firstRender = useRef(true);
    const { flash } = useInertiaShared();
    const { data: filterData, setData: setFilterData } = useForm({
        search: filters.search || "",
        customer_type: filters.customer_type || "",
        payment_method: filters.payment_method || "",
        start_date: filters.start_date || "",
        end_date: filters.end_date || "",
    });

    const handleFilter = (key: keyof typeof filterData, value: string) => {
        setFilterData(key, value);
    };

    const debounceSearch = inputDebounce((data: typeof filterData) => {
        router.get(
            "/cashier/transactions/records",
            {
                ...data,
            },
            {
                preserveState: true,
                replace: true,
                only: ["transactions"],
            }
        );
    });

    const handleDelete = (trxId: number) => {
        router.delete("/cashier/transactions/" + trxId, {
            preserveScroll: true,
            replace: true,
        });
    };

    const readyPrintReceipt = async (trxId: number) => {
        try {
            const printResponse = await axios.get(
                `/cashier/transactions/print/${trxId}`
            );
            const { transaction: trxData, setting: settingData } =
                printResponse.data;

            const printer = new ReceiptPrinter();
            const bytes = printer.generateReceipt(trxData, settingData);
            // Direct Bluetooth Print
            await printer.printReceipt(bytes);
            BlastToaster("success", "Transaksi berhasil dicetak");
        } catch (error: any) {
            console.error(error);
            BlastToaster("error", "Cetak transaksi dibatalkan");
        }
    };

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        debounceSearch(filterData);
    }, [filterData]);
    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full mb-4">
                <SearchInput
                    placeholder="Cari kode transaksi, pelanggan"
                    className="w-full"
                    onChange={(e) => handleFilter("search", e.target.value)}
                    value={filterData.search || ""}
                />
                <div className="w-full">
                    <SelectSearchInput
                        className="w-full"
                        placeholder="Pilih Tipe Pelanggan"
                        value={filterData.customer_type || ""}
                        options={customerTypeOptions}
                        onChange={(val) =>
                            handleFilter("customer_type", val.toString())
                        }
                        removeValue={() => handleFilter("customer_type", "")}
                    />
                </div>
                <div className="w-full">
                    <SelectSearchInput
                        className="w-full"
                        placeholder="Pilih Pembayaran"
                        value={filterData.payment_method || ""}
                        options={paymentMethodOptions}
                        onChange={(val) =>
                            handleFilter("payment_method", val.toString())
                        }
                        removeValue={() => handleFilter("payment_method", "")}
                    />
                </div>
                <div className="w-full">
                    <DatePickerInput
                        className="w-full"
                        mode="range"
                        placeholder="Rentang tanggal"
                        value={
                            filterData.start_date && filterData.end_date
                                ? {
                                      from: new Date(filterData.start_date),
                                      to: new Date(filterData.end_date),
                                  }
                                : undefined
                        }
                        onChange={(dateRange) => {
                            if (dateRange && typeof dateRange === "string") {
                                const [start, end] = dateRange.split(" - ");
                                setFilterData((prev) => ({
                                    ...prev,
                                    start_date: start,
                                    end_date: end,
                                }));
                            }
                        }}
                    />
                </div>
                <div className="col-span-2">
                    <Link href={"/cashier/transactions/create"}>
                        <Button variant={"yellow"} className="w-full">
                            <CircleFadingPlus />
                            Transaksi Baru
                        </Button>
                    </Link>
                </div>
            </div>

            {transactions.data.length === 0 ? (
                <EmptyCard message="Belum ada transaksi" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {transactions.data.map((trx, index) => (
                        <Card
                            tabIndex={index}
                            key={index}
                            className="relative py-3 overflow-hidden"
                        >
                            <CardContent className="px-3">
                                <div className="flex flex-col mb-3">
                                    <h3 className="font-semibold text-md">
                                        {trx.invoice_code}
                                    </h3>
                                    <span className="text-xs text-gray-600">
                                        <Badge
                                            variant="outline"
                                            className="me-2"
                                        >
                                            Pelanggan{" "}
                                            {humanCustType(trx.customer_type)}
                                        </Badge>
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {/*cusomer name*/}
                                    <div className="flex items-center gap-2">
                                        <Users size={16} />
                                        <span className="text-sm">
                                            {trx.customer?.name || "-"}
                                        </span>
                                    </div>
                                    {/*sku sold*/}
                                    <div className="flex items-center gap-2">
                                        <Package size={16} />
                                        <span className="text-sm">
                                            {trx?.sku_sold} produk terjual
                                        </span>
                                    </div>
                                    {/*total payment*/}
                                    <div className="flex items-center gap-2">
                                        <BanknoteArrowUp size={16} />
                                        <span className="text-sm">
                                            {humanPaymentMethod(
                                                trx.payment_method
                                            )}{" "}
                                            {trx.payment_provider
                                                ? ` ${trx.payment_provider}`
                                                : ""}{" "}
                                            - {floatToIdCurrency(trx.total)}
                                        </span>
                                    </div>
                                    {/*trx time*/}
                                    <div className="flex items-center gap-2">
                                        <Clock9 size={16} />
                                        <span className="text-sm">
                                            {ymdToIdDate(
                                                trx.transaction_time,
                                                true
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 mt-4">
                                    <Link
                                        href={`/cashier/transactions/${trx.id}`}
                                    >
                                        <Button variant="outline">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    {flash.user.id === trx.cashier_id && (
                                        <Link
                                            href={`/cashier/transactions/${trx.id}/edit`}
                                        >
                                            <Button variant="outline">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            readyPrintReceipt(trx.id)
                                        }
                                    >
                                        <ReceiptText className="h-4 w-4" />
                                    </Button>
                                    {flash.user.id === trx.cashier_id && (
                                        <ConfirmDialog
                                            triggerNode={
                                                <div>
                                                    <Button
                                                        variant="outline"
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            }
                                            title="Hapus Transaksi"
                                            description="Menghapus transaksi akan mengakibatkan hilanganya informasi transaksi termasuk poin pelanggan. Apakah anda yakin ?"
                                            type="danger"
                                            confirmAction={() =>
                                                handleDelete(trx.id)
                                            }
                                        />
                                    )}
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
export default CashierTransactionIndex;
