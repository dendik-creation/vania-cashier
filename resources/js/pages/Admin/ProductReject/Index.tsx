import AppLayout from "@/partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/partials/PageTitle";
import { PaginationData, SelectOption } from "@/types/global";
import { ProductReject } from "@/types/product_reject";
import React, { useEffect, useRef } from "react";
import {
    PaginatorBuilder,
    SearchInput,
    SelectSearchInput,
} from "@/components/custom/FormElement";
import { inputDebounce, ymdToIdDate } from "@/components/helper/helper";
import { router, useForm } from "@inertiajs/react";
import AdminProductRejectCreate from "./ModalCreate";
import AdminProductRejectEdit from "./ModalEdit";
import ConfirmDialog from "@/components/custom/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import EmptyCard from "@/components/custom/EmptyCard";
import { Badge } from "@/components/ui/badge";
import { Trash2, Box, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type PageProps = PageTitleProps & {
    product_rejects: PaginationData<ProductReject>;
    filters: {
        search: string;
        status: string;
    };
    variants: SelectOption[];
};

const AdminProductReject = ({
    title,
    description,
    filters,
    product_rejects,
}: PageProps) => {
    const firstRender = useRef(true);
    const { data: filterData, setData: setFilterData } = useForm({
        search: filters.search || "",
        status: filters.status || "",
    });

    const handleFilter = (key: keyof typeof filterData, value: string) => {
        setFilterData(key, value);
    };

    const debounceSearch = inputDebounce((data: typeof filterData) => {
        router.get(
            "/admin/product-rejects",
            {
                search: data.search,
                status: data.status,
            },
            {
                preserveState: true,
                replace: true,
                only: ["product_rejects"],
            }
        );
    });

    const handleDelete = (id: number) => {
        router.delete(`/admin/product-rejects/${id}`, {
            preserveScroll: true,
            replace: true,
            only: ["product_rejects"],
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
                        placeholder={`Cari produk atau sku`}
                        className="lg:max-w-sm w-full"
                        onChange={(e) => handleFilter("search", e.target.value)}
                        value={filterData.search || ""}
                    />
                    <div className="w-full lg:w-fit">
                        <SelectSearchInput
                            className="w-full"
                            placeholder="Pilih Status"
                            value={filterData.status || ""}
                            options={[
                                {
                                    label: "Pending",
                                    value: "pending",
                                },
                                {
                                    label: "Selesai",
                                    value: "done",
                                },
                            ]}
                            onChange={(value) =>
                                handleFilter("status", value.toString())
                            }
                            removeValue={() => handleFilter("status", "")}
                        />
                    </div>
                </div>
                <AdminProductRejectCreate />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {product_rejects.data.map((item) => (
                    <Card
                        key={item.id}
                        className="relative py-3 overflow-hidden"
                    >
                        <CardContent className="px-3">
                            <div className="flex flex-col mb-2">
                                <h3 className="font-semibold">
                                    {item.variant?.product?.name}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {item.variant?.sku} -{" "}
                                    {item.variant?.attributes?.color ?? "-"} -{" "}
                                    {item.variant?.attributes?.size ?? "-"}
                                </p>
                            </div>

                            <Badge
                                variant={
                                    item.status === "done" ? "green" : "yellow"
                                }
                            >
                                {item.status === "done" ? "Selesai" : "Pending"}
                            </Badge>

                            <div className="flex flex-col gap-2 text-sm mt-4">
                                <div className="flex items-center gap-2">
                                    <Box className="h-4 w-4 text-muted-foreground" />
                                    <span>{item.quantity} Unit</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span>{ymdToIdDate(item.rejected_at)}</span>
                                </div>
                                <div className="text-muted-foreground line-clamp-2">
                                    {item.reason}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 mt-4">
                                <AdminProductRejectEdit reject={item} />
                                <ConfirmDialog
                                    triggerNode={
                                        <Button variant="outline" size="icon">
                                            <Trash2 className="text-destructive hover:text-destructive" />
                                        </Button>
                                    }
                                    title="Hapus Reject"
                                    description={
                                        item.status === "pending"
                                            ? "Menghapus data pending akan mengembalikan stok ke produk. Lanjutkan?"
                                            : "Menghapus data selesai tidak akan mengubah stok saat ini. Lanjutkan?"
                                    }
                                    type="danger"
                                    confirmAction={() => handleDelete(item.id)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {product_rejects.data.length === 0 && <EmptyCard />}
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-center mt-3">
                <p className="text-sm w-full">
                    Total {product_rejects.total} Data
                </p>
                {product_rejects.total > product_rejects.per_page && (
                    <PaginatorBuilder
                        prevUrl={product_rejects.prev_page_url || ""}
                        nextUrl={product_rejects.next_page_url || ""}
                        currentPage={product_rejects.current_page}
                        totalPage={product_rejects.last_page}
                    />
                )}
            </div>
        </AppLayout>
    );
};

export default AdminProductReject;
