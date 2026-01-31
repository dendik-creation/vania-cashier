import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorInput, SelectSearchInput } from "@/components/custom/FormElement";
import AppLayout from "@/partials/AppLayout";
import { PageTitle } from "@/partials/PageTitle";
import { Link, useForm } from "@inertiajs/react";
import { Plus, Trash2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminProductCreateProps, VariantFormData } from "@/types/product";
import { humanProductType } from "@/components/helper/helper";
import { Switch } from "@/components/ui/switch";

const AdminProductCreate = ({
    title,
    description,
    available_types,
}: AdminProductCreateProps) => {
    const { data, setData, post, processing, errors, clearErrors, setError } =
        useForm({
            name: "",
            type: "",
            brand: "",
            with_price_criteria: true,
            can_earn_point: true,
            variants: [] as VariantFormData[],
        });

    const addVariant = () => {
        setData("variants", [
            ...data.variants,
            {
                sku: "",
                attributes: { color: "", size: "" },
                price_criteria: {
                    basic: "",
                    reseller: "",
                    order_qty_3: "",
                    order_qty_6: "",
                },
                stock: 0,
            },
        ]);
    };

    const removeVariant = (index: number) => {
        const newVariants = [...data.variants];
        newVariants.splice(index, 1);
        setData("variants", newVariants);
    };

    const updateVariant = (index: number, field: string, value: any) => {
        const newVariants = [...data.variants];

        if (field === "color" || field === "size") {
            newVariants[index] = {
                ...newVariants[index],
                attributes: {
                    ...newVariants[index].attributes,
                    [field]: value,
                },
            };
        } else if (
            field === "basic" ||
            field === "reseller" ||
            field === "order_qty_3" ||
            field === "order_qty_6"
        ) {
            newVariants[index] = {
                ...newVariants[index],
                price_criteria: {
                    ...newVariants[index].price_criteria,
                    [field]: value,
                },
            };
        } else {
            newVariants[index] = { ...newVariants[index], [field]: value };
        }

        setData("variants", newVariants);
    };

    const validateForm = (): boolean => {
        let isValid = true;
        clearErrors();

        // Validasi informasi produk
        if (!data.name || data.name.trim() === "") {
            setError("name", "Nama produk wajib diisi");
            isValid = false;
        }

        if (!data.type || data.type.trim() === "") {
            setError("type", "Tipe produk wajib dipilih");
            isValid = false;
        }

        // Validasi varian
        if (!data.variants || data.variants.length === 0) {
            setError("variants", "Minimal harus ada 1 varian produk");
            isValid = false;
            return isValid;
        }

        // Validasi setiap varian
        data.variants.forEach((variant, index) => {
            // Kode barang wajib
            if (!variant.sku || variant.sku.trim() === "") {
                setError(`variants.${index}.sku`, "Kode Barang wajib diisi");
                isValid = false;
            }

            // Validasi price criteria - Harga Dasar
            if (
                !variant.price_criteria.basic ||
                variant.price_criteria.basic === ""
            ) {
                setError(
                    `variants.${index}.price_criteria.basic`,
                    "Harga dasar wajib diisi",
                );
                isValid = false;
            } else if (Number(variant.price_criteria.basic) <= 0) {
                setError(
                    `variants.${index}.price_criteria.basic`,
                    "Harga dasar harus lebih dari 0",
                );
                isValid = false;
            }

            if (data.with_price_criteria) {
                // Validasi price criteria - Harga Reseller
                if (
                    !variant.price_criteria.reseller ||
                    variant.price_criteria.reseller === ""
                ) {
                    setError(
                        `variants.${index}.price_criteria.reseller`,
                        "Harga reseller wajib diisi",
                    );
                    isValid = false;
                }

                // Validasi price criteria - Harga qty 3+
                if (
                    !variant.price_criteria.order_qty_3 ||
                    variant.price_criteria.order_qty_3 === ""
                ) {
                    setError(
                        `variants.${index}.price_criteria.order_qty_3`,
                        "Harga qty 3+ wajib diisi",
                    );
                    isValid = false;
                }

                // Validasi price criteria - Harga qty 6+
                if (
                    !variant.price_criteria.order_qty_6 ||
                    variant.price_criteria.order_qty_6 === ""
                ) {
                    setError(
                        `variants.${index}.price_criteria.order_qty_6`,
                        "Harga qty 6+ wajib diisi",
                    );
                    isValid = false;
                }
            }

            // Validasi stok
            if (
                variant.stock === "" ||
                variant.stock === null ||
                variant.stock === undefined
            ) {
                setError(`variants.${index}.stock`, "Stok wajib diisi");
                isValid = false;
            } else if (Number(variant.stock) < 0) {
                setError(`variants.${index}.stock`, "Stok tidak boleh negatif");
                isValid = false;
            }
        });

        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        post("/cashier/products", {
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AppLayout>
            <PageTitle title={title} description={description} />
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Produk</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="name"
                                className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1"
                            >
                                Nama Produk
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                placeholder="Masukkan nama produk"
                            />
                            <ErrorInput error={errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="type"
                                className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1"
                            >
                                Tipe Produk
                            </Label>
                            <SelectSearchInput
                                value={data.type}
                                options={[
                                    ...available_types.map((type: string) => ({
                                        label: humanProductType(type),
                                        value: type,
                                    })),
                                ]}
                                onChange={(val) =>
                                    setData("type", val.toString())
                                }
                                placeholder="Pilih Tipe"
                            />
                            <ErrorInput error={errors.type} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="brand" className="text-base mb-1">
                                Brand
                            </Label>
                            <Input
                                id="brand"
                                value={data.brand}
                                onChange={(e) =>
                                    setData("brand", e.target.value)
                                }
                                placeholder="Masukkan brand produk"
                            />
                            <ErrorInput error={errors.brand} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-8">
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor="brand"
                                        className="text-base mb-1"
                                    >
                                        Gunakan Variasi Harga
                                    </Label>
                                    <Switch
                                        checked={data.with_price_criteria}
                                        onCheckedChange={(value) =>
                                            setData(
                                                "with_price_criteria",
                                                value,
                                            )
                                        }
                                    />
                                    <ErrorInput
                                        error={errors.with_price_criteria}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor="can_earn_point"
                                        className="text-base mb-1"
                                    >
                                        Dapat Menghasilkan Poin
                                    </Label>
                                    <Switch
                                        checked={data.can_earn_point}
                                        onCheckedChange={(value) =>
                                            setData("can_earn_point", value)
                                        }
                                    />
                                    <ErrorInput error={errors.can_earn_point} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle>Varian Produk</CardTitle>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addVariant}
                        >
                            <Plus className="w-4 h-4 mr-2" /> Tambah Varian
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {data.variants.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Varian belum ditambahkan.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.variants.map((variant, index) => (
                                    <div
                                        key={index}
                                        className="border p-4 rounded-md space-y-4"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1 md:col-span-2">
                                                <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                    Kode Barang
                                                </Label>
                                                <div className="flex items-start gap-3">
                                                    <Input
                                                        value={variant.sku}
                                                        onChange={(e) =>
                                                            updateVariant(
                                                                index,
                                                                "sku",
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Masukkan Kode Barang"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeVariant(index)
                                                        }
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Hapus Varian
                                                    </Button>
                                                </div>
                                                <ErrorInput
                                                    error={
                                                        errors[
                                                            `variants.${index}.sku` as any
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-base mb-1">
                                                    Warna
                                                </Label>
                                                <Input
                                                    value={
                                                        variant.attributes
                                                            .color || ""
                                                    }
                                                    onChange={(e) =>
                                                        updateVariant(
                                                            index,
                                                            "color",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Masukkan warna"
                                                />
                                                <ErrorInput
                                                    error={
                                                        errors[
                                                            `variants.${index}.attributes.color` as any
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-base mb-1">
                                                    Ukuran (Jika perlu)
                                                </Label>
                                                <Input
                                                    value={
                                                        variant.attributes
                                                            .size || ""
                                                    }
                                                    onChange={(e) =>
                                                        updateVariant(
                                                            index,
                                                            "size",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Masukkan ukuran"
                                                />
                                                <ErrorInput
                                                    error={
                                                        errors[
                                                            `variants.${index}.attributes.size` as any
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                    Stok
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={variant.stock}
                                                    onChange={(e) =>
                                                        updateVariant(
                                                            index,
                                                            "stock",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="0"
                                                />
                                                <ErrorInput
                                                    error={
                                                        errors[
                                                            `variants.${index}.stock` as any
                                                        ]
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {/* Price Criteria Section */}
                                        <div className="border-t pt-4">
                                            <h4 className="font-semibold mb-3 text-sm">
                                                Kriteria Harga
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                        Harga Dasar
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            variant
                                                                .price_criteria
                                                                .basic
                                                        }
                                                        onChange={(e) =>
                                                            updateVariant(
                                                                index,
                                                                "basic",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <ErrorInput
                                                        error={
                                                            errors[
                                                                `variants.${index}.price_criteria.basic` as any
                                                            ]
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                        Harga Reseller
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            variant
                                                                .price_criteria
                                                                .reseller
                                                        }
                                                        onChange={(e) =>
                                                            updateVariant(
                                                                index,
                                                                "reseller",
                                                                e.target.value,
                                                            )
                                                        }
                                                        disabled={
                                                            !data.with_price_criteria
                                                        }
                                                    />
                                                    <ErrorInput
                                                        error={
                                                            errors[
                                                                `variants.${index}.price_criteria.reseller` as any
                                                            ]
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                        Harga Qty 3+
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            variant
                                                                .price_criteria
                                                                .order_qty_3
                                                        }
                                                        onChange={(e) =>
                                                            updateVariant(
                                                                index,
                                                                "order_qty_3",
                                                                e.target.value,
                                                            )
                                                        }
                                                        disabled={
                                                            !data.with_price_criteria
                                                        }
                                                    />
                                                    <ErrorInput
                                                        error={
                                                            errors[
                                                                `variants.${index}.price_criteria.order_qty_3` as any
                                                            ]
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                        Harga Qty 6+
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            variant
                                                                .price_criteria
                                                                .order_qty_6
                                                        }
                                                        onChange={(e) =>
                                                            updateVariant(
                                                                index,
                                                                "order_qty_6",
                                                                e.target.value,
                                                            )
                                                        }
                                                        disabled={
                                                            !data.with_price_criteria
                                                        }
                                                    />
                                                    <ErrorInput
                                                        error={
                                                            errors[
                                                                `variants.${index}.price_criteria.order_qty_6` as any
                                                            ]
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <ErrorInput error={errors.variants} />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" asChild>
                        <Link href={"/admin/products"}>Batal</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        <Save className="w-4 h-4 mr-2" /> Simpan Produk
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
};

export default AdminProductCreate;
