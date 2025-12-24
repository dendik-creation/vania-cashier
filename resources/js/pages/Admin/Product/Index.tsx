import {
    PaginatorBuilder,
    SearchInput,
    SelectSearchInput,
} from "@/components/custom/FormElement";
import { humanProductType, inputDebounce } from "@/components/helper/helper";
import { Button } from "@/components/ui/button";
import AppLayout from "@/partials/AppLayout";
import { PageTitle } from "@/partials/PageTitle";
import { router, useForm, Link } from "@inertiajs/react";
import {
    Trash2,
    Edit,
    Eye,
    CircleFadingPlus,
    Footprints,
    Handbag,
    Sparkles,
    Package,
    Tags,
    PackageSearch,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EmptyCard from "@/components/custom/EmptyCard";
import { AdminProductIndexProps } from "@/types/product";
import ConfirmDialog from "@/components/custom/ConfirmDialog";

const AdminProductIndex = ({
    title,
    description,
    products,
    filters,
}: AdminProductIndexProps) => {
    const firstRender = useRef(true);
    const { data: filterData, setData: setFilterData } = useForm({
        search: filters.search || "",
        type: filters.type || "",
    });

    const handleFilter = (key: keyof typeof filterData, value: string) => {
        setFilterData(key, value);
    };

    const renderIconByType = ({
        type,
        size,
    }: {
        type: string;
        size: number;
    }) => {
        switch (type) {
            case "shoes":
                return <Footprints size={size} />;
            case "bag":
                return <Handbag size={size} />;
            case "accessory":
                return <Sparkles size={size} />;
            default:
                return <Package size={size} />;
        }
    };

    const debounceSearch = inputDebounce((data: typeof filterData) => {
        router.get(
            "/admin/products",
            {
                search: data.search,
                type: data.type,
            },
            {
                preserveState: true,
                replace: true,
                only: ["products"],
            },
        );
    });

    const handleDelete = (productId: number) => {
        router.delete("/admin/products/" + productId, {
            preserveScroll: true,
            replace: true,
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
                        placeholder="Cari nama produk atau brand"
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
                                { label: "Semua Tipe", value: "" },
                                { label: "Sepatu", value: "shoes" },
                                { label: "Tas", value: "bag" },
                                { label: "Aksesoris", value: "accessory" },
                            ]}
                            onChange={(val) =>
                                handleFilter("type", val.toString())
                            }
                            removeValue={() => handleFilter("type", "")}
                        />
                    </div>
                </div>
                <Link href={"/admin/products/create"}>
                    <Button variant={"yellow"} className="w-full lg:w-fit">
                        <CircleFadingPlus />
                        Tambah Produk
                    </Button>
                </Link>
            </div>

            {products.data.length === 0 ? (
                <EmptyCard />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.data.map((product, index) => (
                        <Card
                            tabIndex={index}
                            key={index}
                            className="relative py-3 overflow-hidden"
                        >
                            {/*Icon*/}
                            <div className="absolute -top-4 -right-4 text-slate-300">
                                {renderIconByType({
                                    type: product.type,
                                    size: 75,
                                })}
                            </div>
                            <CardContent className="px-3">
                                {/*Product Name*/}
                                <div className="flex flex-col mb-3">
                                    <h3 className="font-semibold text-md">
                                        {product.name}
                                    </h3>
                                    <span className="text-xs text-gray-600">
                                        <Badge
                                            variant="outline"
                                            className="me-2"
                                        >
                                            {humanProductType(product.type)}
                                        </Badge>
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Tags size={16} />
                                        <span className="text-sm">
                                            {product.brand || "Tanpa Brand"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <PackageSearch size={16} />
                                        <span className="text-sm">
                                            {product.variants_count
                                                ? `${product.variants_count} Varian`
                                                : "Tanpa Varian"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 mt-4">
                                    <Link
                                        href={`/admin/products/${product.id}`}
                                    >
                                        <Button variant="outline">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Link
                                        href={`/admin/products/${product.id}/edit`}
                                    >
                                        <Button variant="outline">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </Link>
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
                                        title="Hapus Produk"
                                        description="Menghapus produk ini akan menghapus semua data terkait produk termasuk transaksi. Apakah anda yakin ?"
                                        type="danger"
                                        confirmAction={() =>
                                            handleDelete(product.id)
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {products.data.length > 0 && (
                <PaginatorBuilder
                    prevUrl={products.prev_page_url || ""}
                    nextUrl={products.next_page_url || ""}
                    currentPage={products.current_page}
                    totalPage={products.last_page}
                />
            )}
        </AppLayout>
    );
};

export default AdminProductIndex;
