import {
    PaginatorBuilder,
    SearchInput,
    SelectSearchInput,
} from "@/components/custom/FormElement";
import {
    humanCustType,
    inputDebounce,
    ymdToIdDate,
} from "@/components/helper/helper";
import { Button } from "@/components/ui/button";
import AppLayout from "@/partials/AppLayout";
import { PageTitle } from "@/partials/PageTitle";
import { CustomerIndexProps } from "@/types/customer";
import { Link, router, useForm } from "@inertiajs/react";
import { Calendar, Coins, Eye, Phone, ReceiptText, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import CashierCustomerCreate from "./ModalCreate";
import ConfirmDialog from "@/components/custom/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EmptyCard from "@/components/custom/EmptyCard";
import CashierCustomerEdit from "./ModalEdit";

const CashierCustomerIndex = ({
    title,
    description,
    customers,
    filters,
}: CustomerIndexProps) => {
    const firstRender = useRef(true);
    const { data: filterData, setData: setFilterData } = useForm({
        search: filters.search || "",
        type: filters.type || "",
    });

    const handleFilter = (key: keyof typeof filterData, value: string) => {
        setFilterData(key, value);
    };

    const debounceSearch = inputDebounce((data: typeof filterData) => {
        router.get(
            "/cashier/customers",
            {
                search: data.search,
                type: data.type,
            },
            {
                preserveState: true,
                replace: true,
                only: ["customers"],
            }
        );
    });

    const handleDelete = (id: number) => {
        router.delete(`/cashier/customers/${id}`, {
            preserveScroll: true,
            replace: true,
            only: ["customers"],
        });
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
            <div className="flex flex-col lg:flex-row lg:justify-between items-center gap-3 mb-4">
                <div className="flex flex-col lg:flex-row items-center gap-3 w-full">
                    <SearchInput
                        placeholder={`Cari nama atau no hp`}
                        className="lg:max-w-sm w-full"
                        onChange={(e) => handleFilter("search", e.target.value)}
                        value={filterData.search || ""}
                    />
                    <div className="w-full lg:w-fit">
                        <SelectSearchInput
                            className="w-full"
                            placeholder="Pilih Tipe"
                            value={filterData.type || ""}
                            options={[
                                {
                                    label: "Member",
                                    value: "member",
                                },
                                {
                                    label: "Reseller",
                                    value: "reseller",
                                },
                            ]}
                            onChange={(value) =>
                                handleFilter("type", value.toString())
                            }
                            removeValue={() => handleFilter("type", "")}
                        />
                    </div>
                </div>
                <CashierCustomerCreate />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {customers.data.map((item, index) => (
                    <Card
                        key={item.id}
                        className="relative py-3 overflow-hidden"
                    >
                        <CardContent className="px-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-semibold text-gray-900">
                                                {item.name}
                                            </span>
                                            <Badge
                                                variant={
                                                    item.type == "member"
                                                        ? "green"
                                                        : "blue"
                                                }
                                            >
                                                {humanCustType(item.type)}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} />
                                            <span className="text-sm">
                                                No.Hp {item.phone || "-"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            <span className="text-sm">
                                                Bergabung{" "}
                                                {ymdToIdDate(item.joined_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Coins size={16} />
                                            <span className="text-sm">
                                                {item.points} Poin
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ReceiptText size={16} />
                                            <span className="text-sm">
                                                {item.transactions_count || 0}{" "}
                                                Transaksi
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-4">
                                <Link
                                    href={`/cashier/transactions/records?search=${item.phone}`}
                                >
                                    <Button variant="outline">
                                        <Eye className="" />
                                    </Button>
                                </Link>
                                <CashierCustomerEdit customer={item} />
                                <ConfirmDialog
                                    triggerNode={
                                        <Button variant="outline">
                                            <Trash2 className="text-destructive hover:text-destructive" />
                                        </Button>
                                    }
                                    title="Hapus Pelanggan"
                                    description="Menghapus pelanggan menyebabkan kehilangan rekap transaksi terkait. Apakah anda yakin ?"
                                    type="danger"
                                    confirmAction={() => handleDelete(item.id)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {customers.data.length === 0 && <EmptyCard />}
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-center mt-3">
                <p className="text-sm w-full">
                    Total {customers.total} Pelanggan
                </p>
                {customers.total > customers.per_page && (
                    <PaginatorBuilder
                        prevUrl={customers.prev_page_url || ""}
                        nextUrl={customers.next_page_url || ""}
                        currentPage={customers.current_page}
                        totalPage={customers.last_page}
                    />
                )}
            </div>
        </AppLayout>
    );
};

export default CashierCustomerIndex;
