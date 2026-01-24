import { Button } from "@/components/ui/button";
import AppLayout from "@/partials/AppLayout";
import { PageTitle } from "@/partials/PageTitle";
import { Link, router, useForm, usePage } from "@inertiajs/react";
import { Edit, ArrowLeft } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminProductShowProps } from "@/types/product";
import {
    floatToIdCurrency,
    humanProductType,
} from "@/components/helper/helper";
import { SearchInput } from "@/components/custom/FormElement";

const AdminProductShow = ({
    title,
    description,
    product,
}: AdminProductShowProps) => {
    const searchParam =
        typeof window !== "undefined" && window.location.search
            ? new URLSearchParams(window.location.search).get("search") || ""
            : "";
    const { data: variant, setData: setVariant } = useForm({
        search: searchParam || "",
        variantResults: product.variants || [],
    });

    const handleSearchVariant = (search: string) => {
        const filteredVariants = product.variants.filter((variant) =>
            variant.sku.toLowerCase().includes(search.toLowerCase()),
        );
        setVariant({
            ...variant,
            search: search,
            variantResults: filteredVariants,
        });
    };
    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle>Informasi Produk</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <Link href={"/admin/products"}>
                                    <ArrowLeft className="w-4 h-4 mr-2" />{" "}
                                    Kembali
                                </Link>
                            </Button>
                            <Button variant="yellow" asChild>
                                <Link
                                    href={`/admin/products/${product.id}/edit`}
                                >
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                    Produk
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                Nama Produk
                            </h3>
                            <p className="text-lg font-semibold">
                                {product.name}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                Tipe
                            </h3>
                            <Badge
                                variant="secondary"
                                className="mt-1 capitalize"
                            >
                                {humanProductType(product.type)}
                            </Badge>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                Brand
                            </h3>
                            <p className="text-base">{product.brand || "-"}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                Menerapkan variasi harga
                            </h3>
                            <Badge variant={"outline"}>
                                {product.with_price_criteria ? "Ya" : "Tidak"}
                            </Badge>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                Dapat menghasilkan poin
                            </h3>
                            <Badge variant={"outline"}>
                                {product.can_earn_point ? "Ya" : "Tidak"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Varian</CardTitle>
                        <CardDescription className="text-black">
                            <div className="flex">
                                <SearchInput
                                    placeholder="Cari kode produk"
                                    className="lg:max-w-sm w-full"
                                    onChange={(e) =>
                                        handleSearchVariant(e.target.value)
                                    }
                                    value={variant.search || ""}
                                />
                            </div>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[150px]">
                                            Kode Barang
                                        </TableHead>
                                        <TableHead className="min-w-[100px]">
                                            Warna
                                        </TableHead>
                                        {product.type === "sepatu" && (
                                            <TableHead className="min-w-20">
                                                Ukuran
                                            </TableHead>
                                        )}
                                        <TableHead className="min-w-[120px]">
                                            Harga Dasar
                                        </TableHead>
                                        <TableHead className="min-w-[120px]">
                                            Harga Reseller
                                        </TableHead>
                                        <TableHead className="min-w-[120px]">
                                            Harga Qty 3+
                                        </TableHead>
                                        <TableHead className="min-w-[120px]">
                                            Harga Qty 6+
                                        </TableHead>
                                        <TableHead className="min-w-20">
                                            Stok
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!variant.variantResults ||
                                    variant.variantResults.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={
                                                    product.type === "sepatu"
                                                        ? 8
                                                        : 7
                                                }
                                                className="text-center py-6 text-muted-foreground"
                                            >
                                                Tidak ada varian
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        variant.variantResults.map(
                                            (variant) => (
                                                <TableRow key={variant.id}>
                                                    <TableCell className="font-mono">
                                                        <pre>{variant.sku}</pre>
                                                    </TableCell>
                                                    <TableCell>
                                                        {variant.attributes
                                                            ?.color || "-"}
                                                    </TableCell>
                                                    {product.type ===
                                                        "sepatu" && (
                                                        <TableCell>
                                                            {variant.attributes
                                                                ?.size || "-"}
                                                        </TableCell>
                                                    )}
                                                    <TableCell>
                                                        <span className="font-normal">
                                                            {floatToIdCurrency(
                                                                variant
                                                                    .price_criteria
                                                                    ?.basic ||
                                                                    0,
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-normal">
                                                            {floatToIdCurrency(
                                                                variant
                                                                    .price_criteria
                                                                    ?.reseller ||
                                                                    0,
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-normal">
                                                            {floatToIdCurrency(
                                                                variant
                                                                    .price_criteria
                                                                    ?.order_qty_3 ||
                                                                    0,
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-normal">
                                                            {floatToIdCurrency(
                                                                variant
                                                                    .price_criteria
                                                                    ?.order_qty_6 ||
                                                                    0,
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                variant.stock >
                                                                0
                                                                    ? "default"
                                                                    : "destructive"
                                                            }
                                                        >
                                                            {variant.stock}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default AdminProductShow;
