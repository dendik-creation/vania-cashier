import BlastToaster from "@/components/custom/BlastToaster";
import EmptyCard from "@/components/custom/EmptyCard";
import { SearchInput } from "@/components/custom/FormElement";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import AppLayout from "@/partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/partials/PageTitle";
import { ProductVariant } from "@/types/product";
import { useForm } from "@inertiajs/react";
import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ReceiptPrinter } from "@/utils/printer";
import {
    BadgeCheck,
    BadgeX,
    ChevronLeft,
    ChevronRight,
    CircleX,
    Footprints,
    Handbag,
    Loader,
    Package,
    PaintBucket,
    Printer,
    RulerDimensionLine,
    Save,
    Sparkles,
} from "lucide-react";
import { useEffect } from "react";

type PageProps = PageTitleProps & {
    product_variants: ProductVariant[];
};

const AdminProductLabelIndex = ({
    title,
    description,
    product_variants,
}: PageProps) => {
    const { data: filterData, setData: setFilterData } = useForm({
        search: "",
    });
    const { data: variantList, setData: setVariantList } =
        useForm<(ProductVariant & { copies?: number })[]>(product_variants);
    const {
        data: form,
        setData: setForm,
        processing: formProcessing,
        errors: formErrors,
    } = useForm({
        step: 1,
        item_per_row: 1 as 1 | 2 | 3,
        selected_variants: [] as (ProductVariant & { copies?: number })[],
        filtered_selected_variants: [] as (ProductVariant & {
            copies?: number;
        })[],
        on_scanning_printer: false,
    });

    const handleFilterChange = (
        field: keyof typeof filterData,
        value: string
    ) => {
        setFilterData(field, value);
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

    const filterVariants = () => {
        let filtered =
            form.step === 1 ? product_variants : form.selected_variants;
        if (filterData.search) {
            filtered = filtered.filter((variant) => {
                const productName = variant.product_name || "";
                const sku = variant.sku || "";
                const searchTerm = filterData.search!.toLowerCase();
                return (
                    productName.toLowerCase().includes(searchTerm) ||
                    sku.toLowerCase().includes(searchTerm)
                );
            });
        }
        if (form.step == 1) {
            setVariantList(filtered);
        } else if (form.step == 2) {
            setForm("filtered_selected_variants", filtered);
        }
    };

    const handleFormStep = (action: "next" | "previous") => {
        if (action == "next" && form.step >= 3) return;
        if (action == "previous" && form.step <= 1) return;
        if (action == "next" && form.selected_variants.length === 0)
            return BlastToaster("warning", "Pilih minimal 1");
        setForm("step", action == "next" ? form.step + 1 : form.step - 1);
    };

    const handleVariantForm = (sku: string) => {
        let selectedVariants = form.selected_variants || [];
        if (selectedVariants.some((variant) => variant.sku === sku)) {
            selectedVariants = selectedVariants.filter(
                (variant) => variant.sku !== sku
            );
        } else {
            const variantToAdd = variantList.find(
                (variant) => variant.sku === sku
            );
            if (variantToAdd) {
                selectedVariants.push(variantToAdd);
            }
        }
        setForm("selected_variants", selectedVariants);
        setForm("filtered_selected_variants", selectedVariants);
    };

    const checkVariantSelected = (sku: string) => {
        return form.selected_variants!.some((variant) => variant.sku === sku);
    };

    const selectOrNotAll = () => {
        if (form.selected_variants.length === product_variants.length) {
            setForm("selected_variants", []);
            setForm("filtered_selected_variants", []);
        } else {
            setForm("selected_variants", variantList);
            setForm("filtered_selected_variants", variantList);
        }
    };

    const readyForPrint = async () => {
        setForm("on_scanning_printer", true);
        // handle mulai print label
        try {
            const printer = new ReceiptPrinter();
            await printer.printLabel(
                form.filtered_selected_variants,
                form.item_per_row
            );
            BlastToaster("success", "Label berhasil dicetak");
        } catch (error: any) {
            console.error(error);
            BlastToaster("error", error.message || "Gagal mencetak label");
        }

        // jika selesai set false lagi
        setForm("on_scanning_printer", false);
    };

    const handleSubmit = () => {
        if (form.selected_variants.length === 0) {
            return BlastToaster("warning", "Pilih minimal 1");
        }
    };

    useEffect(() => {
        filterVariants();
    }, [filterData]);
    return (
        <AppLayout>
            <PageTitle title={title} description={description} />
            <div className="flex flex-col gap-3 lg:flex-row justify-between items-center w-full mb-4">
                <SearchInput
                    disabled={formProcessing}
                    placeholder="Cari nama produk atau sku"
                    className="w-full"
                    onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                    }
                    value={filterData.search || ""}
                />
                <div className="flex flex-col lg:flex-row w-full lg:w-fit items-center gap-2">
                    {form.step > 1 && (
                        <Button
                            type="button"
                            className="w-full lg:w-fit"
                            onClick={() => handleFormStep("previous")}
                            variant={"outline"}
                        >
                            <ChevronLeft />
                            <span>Sebelumnya</span>
                        </Button>
                    )}
                    {form.step == 1 && (
                        <Button
                            type="button"
                            className="w-full lg:w-fit"
                            onClick={() => selectOrNotAll()}
                            variant={"outline"}
                        >
                            {form.selected_variants.length ===
                            product_variants.length ? (
                                <span className="flex items-center gap-2">
                                    <BadgeX />
                                    <span>Jangan Semua</span>
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <BadgeCheck />
                                    <span>Pilih Semua</span>
                                </span>
                            )}
                        </Button>
                    )}
                    {form.step == 1 ? (
                        <Button
                            type="button"
                            className="w-full lg:w-fit"
                            onClick={() => handleFormStep("next")}
                            variant={"yellow"}
                        >
                            <span>Berikutnya</span>
                            <ChevronRight />
                        </Button>
                    ) : (
                        <Dialog>
                            <DialogTrigger asChild>
                                <span>
                                    <Button
                                        type="button"
                                        className="w-full lg:w-fit"
                                        onClick={() => handleSubmit()}
                                        variant={"green"}
                                    >
                                        <span>Bersiap Cetak</span>
                                        <Save />
                                    </Button>
                                </span>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-4xl">
                                <DialogHeader>
                                    <DialogTitle>Bersiap Cetak</DialogTitle>
                                    <DialogDescription className="mb-3">
                                        Sesuaikan jumlah label per baris
                                    </DialogDescription>
                                    <div className="flex flex-col w-full">
                                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                            Jumlah Label per Baris
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="Masukkan Jumlah Label per Baris"
                                            className="w-full"
                                            value={form.item_per_row || 1}
                                            onChange={(e) =>
                                                setForm(
                                                    "item_per_row",
                                                    e.target
                                                        .value as unknown as
                                                        | 1
                                                        | 2
                                                        | 3
                                                )
                                            }
                                        />
                                    </div>
                                </DialogHeader>
                                <DialogFooter className="mt-9">
                                    <DialogClose
                                        disabled={form.on_scanning_printer}
                                        asChild
                                    >
                                        <Button
                                            variant="red"
                                            className="flex items-center gap-2"
                                        >
                                            <CircleX /> Batalkan
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        variant="yellow"
                                        disabled={form.on_scanning_printer}
                                        onClick={readyForPrint}
                                        className="flex items-center gap-2"
                                    >
                                        {form.on_scanning_printer ? (
                                            <Loader className="animate-spin" />
                                        ) : (
                                            <Printer />
                                        )}{" "}
                                        Cetak Label
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Variant Product Select */}
            {form.step == 1 && (
                <div className="">
                    <p className="text-base mb-2">
                        Klik variasi produk yang dipilih
                    </p>

                    {variantList.length === 0 ? (
                        <EmptyCard message="SKU produk tidak ada" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {variantList.map((item, index) => (
                                <Card
                                    tabIndex={index}
                                    key={index}
                                    onClick={() => handleVariantForm(item.sku)}
                                    className="relative py-3 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                >
                                    {checkVariantSelected(item.sku!) && (
                                        <div className="absolute top-0 right-0 z-10 w-1/4 h-full bg-linear-to-r from-white/0 to-pink-500/20">
                                            <div className="flex justify-center items-center w-full h-full">
                                                <BadgeCheck
                                                    size={36}
                                                    className="text-pink-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <CardContent className="px-3 z-10">
                                        {/*Product Name*/}
                                        <div className="flex flex-col mb-3">
                                            <h3 className="font-semibold text-md">
                                                {item.sku}
                                            </h3>
                                            <span className="text-xs text-gray-600">
                                                <Badge
                                                    variant="outline"
                                                    className="me-2 z-0 flex"
                                                >
                                                    {renderIconByType({
                                                        type:
                                                            item.product_type ||
                                                            "",
                                                        size: 16,
                                                    })}
                                                    <span>
                                                        {item.product_name}
                                                    </span>
                                                </Badge>
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <PaintBucket size={16} />
                                                <span className="text-sm">
                                                    Warna{" "}
                                                    {item.attributes?.color ??
                                                        "-"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <RulerDimensionLine size={16} />
                                                <span className="text-sm">
                                                    Ukuran{" "}
                                                    {item.attributes?.size ??
                                                        "-"}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Adjust copies */}
            {form.step == 2 && (
                <div className="">
                    <p className="text-base mb-2">
                        Atur print copies pada label yang terpilih
                    </p>

                    {form.filtered_selected_variants.length === 0 ? (
                        <EmptyCard message="SKU produk tidak ada" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {form.filtered_selected_variants.map(
                                (item, index) => (
                                    <Card
                                        tabIndex={index}
                                        key={index}
                                        className="relative py-3 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                                    >
                                        <CardContent className="px-3 z-10">
                                            {/*Product Name*/}
                                            <div className="flex flex-col mb-3">
                                                <h3 className="font-semibold text-md">
                                                    {item.sku}
                                                </h3>
                                                <span className="text-xs text-gray-600">
                                                    <Badge
                                                        variant="outline"
                                                        className="me-2 z-0 flex"
                                                    >
                                                        {renderIconByType({
                                                            type:
                                                                item.product_type ||
                                                                "",
                                                            size: 16,
                                                        })}
                                                        <span>
                                                            {item.product_name}
                                                        </span>
                                                    </Badge>
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <PaintBucket size={16} />
                                                    <span className="text-sm">
                                                        Warna{" "}
                                                        {item.attributes
                                                            ?.color ?? "-"}
                                                    </span>
                                                </div>
                                                {item.product_type ==
                                                    "sepatu" && (
                                                    <div className="flex items-center gap-2">
                                                        <RulerDimensionLine
                                                            size={16}
                                                        />
                                                        <span className="text-sm">
                                                            Ukuran{" "}
                                                            {item.attributes
                                                                ?.size ?? "-"}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                        Copy Label
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={item.copies || 1}
                                                        onChange={(e) => {
                                                            const copies =
                                                                Math.max(
                                                                    1,
                                                                    parseInt(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                );
                                                            const updatedVariants =
                                                                [
                                                                    ...form.selected_variants,
                                                                ].map(
                                                                    (
                                                                        variant
                                                                    ) => {
                                                                        if (
                                                                            variant.sku ===
                                                                            item.sku
                                                                        ) {
                                                                            const maxCopies =
                                                                                variant.stock ||
                                                                                1;
                                                                            if (
                                                                                copies >
                                                                                maxCopies
                                                                            ) {
                                                                                return {
                                                                                    ...variant,
                                                                                    copies: maxCopies,
                                                                                };
                                                                            }
                                                                            return {
                                                                                ...variant,
                                                                                copies,
                                                                            };
                                                                        }
                                                                        return variant;
                                                                    }
                                                                );
                                                            setForm(
                                                                "filtered_selected_variants",
                                                                updatedVariants
                                                            );
                                                            setForm(
                                                                "selected_variants",
                                                                updatedVariants
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}
        </AppLayout>
    );
};

export default AdminProductLabelIndex;
