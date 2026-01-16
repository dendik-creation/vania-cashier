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
    Upload,
    Coins,
} from "lucide-react";
import { FormEvent, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EmptyCard from "@/components/custom/EmptyCard";
import { AdminProductIndexProps } from "@/types/product";
import ConfirmDialog from "@/components/custom/ConfirmDialog";
import ModalImport from "@/components/custom/ModalImport";
import BlastToaster from "@/components/custom/BlastToaster";

const AdminProductIndex = ({
    title,
    description,
    products,
    filters,
    available_types,
}: AdminProductIndexProps) => {
    const firstRender = useRef(true);
    const { data: filterData, setData: setFilterData } = useForm({
        search: filters.search || "",
        type: filters.type || "",
    });
    const {
        data: importData,
        setData: setImportData,
        processing: isImporting,
        post: postImport,
    } = useForm({
        xlsx_file: null as File | null,
        openDialog: false as boolean,
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
            case "sepatu":
                return <Footprints size={size} />;
            case "tas":
                return <Handbag size={size} />;
            case "aksesoris":
                return <Sparkles size={size} />;
            default:
                return <Package size={size} />;
        }
    };

    const handleImport = (e: FormEvent) => {
        e.preventDefault();
        if (!importData.xlsx_file) return;
        postImport(`/admin/products/import`, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            preserveScroll: true,
            replace: true,
            onError: (error: any) => {
                BlastToaster("error", error.message || "Gagal mengimpor data");
            },
            onFinish: () => {
                setImportData("xlsx_file", null);
                setImportData("openDialog", false);
            },
        });
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
            }
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
                                ...available_types.map((type: string) => ({
                                    label: humanProductType(type),
                                    value: type,
                                })),
                            ]}
                            onChange={(val) =>
                                handleFilter("type", val.toString())
                            }
                            removeValue={() => handleFilter("type", "")}
                        />
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row w-full lg:w-fit items-center gap-3">
                    <ModalImport
                        description="Silakan download contoh file untuk mengisi data produk"
                        isImporting={isImporting}
                        file={importData.xlsx_file}
                        onFileChange={(file: File | null) =>
                            setImportData("xlsx_file", file)
                        }
                        onSubmit={handleImport}
                        exampleFile="/assets/xlsx-format/import-produk.xlsx"
                        title="Import Produk"
                        triggerNode={
                            <Button
                                variant={"green"}
                                className="cursor-pointer w-full lg:w-fit"
                            >
                                <Upload />
                                <span>Import Produk</span>
                            </Button>
                        }
                        open={importData.openDialog}
                        onOpenChange={(open: boolean) =>
                            setImportData("openDialog", open)
                        }
                    />
                    <Link
                        className="w-full lg:w-fit"
                        href={"/admin/products/label"}
                    >
                        <Button variant={"pink"} className="w-full lg:w-fit">
                            <Tags />
                            Label Produk
                        </Button>
                    </Link>
                    <Link
                        className="w-full lg:w-fit"
                        href={"/admin/products/create"}
                    >
                        <Button variant={"yellow"} className="w-full lg:w-fit">
                            <CircleFadingPlus />
                            Tambah Produk
                        </Button>
                    </Link>
                </div>
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
                            <div className="absolute -top-4 -right-4 text-slate-200">
                                {renderIconByType({
                                    type: product.type,
                                    size: 75,
                                })}
                            </div>
                            <CardContent className="px-3 z-10">
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
                                    <div className="flex items-center gap-2">
                                        <Coins size={16} />
                                        <span className="text-sm">
                                            {product.can_earn_point
                                                ? `Menghasilkan poin`
                                                : "Tidak menghasilkan poin"}
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

            <div className="flex flex-col lg:flex-row justify-between items-center mt-3">
                <p className="text-sm w-full">Total {products.total} Produk</p>
                {products.total > products.per_page && (
                    <PaginatorBuilder
                        prevUrl={products.prev_page_url || ""}
                        nextUrl={products.next_page_url || ""}
                        currentPage={products.current_page}
                        totalPage={products.last_page}
                    />
                )}
            </div>
        </AppLayout>
    );
};

export default AdminProductIndex;
