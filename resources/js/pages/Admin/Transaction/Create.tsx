import { ErrorInput, SelectSearchInput } from "@/components/custom/FormElement";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/partials/PageTitle";
import { TransactionCreateProps } from "@/types/transaction";
import { useForm } from "@inertiajs/react";
import { FormEvent, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReceiptPrinter } from "@/utils/printer";
import {
    CircleFadingPlus,
    Coins,
    Footprints,
    Handbag,
    Loader,
    Package,
    Phone,
    Save,
    Sparkles,
    TicketPercent,
    X,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import BlastToaster from "@/components/custom/BlastToaster";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { floatToIdCurrency, humanCustType } from "@/components/helper/helper";
import { Card, CardContent } from "@/components/ui/card";
type Props = PageTitleProps & TransactionCreateProps;

const AdminTransactionCreate = ({
    eligible_point_minimum,
    idr_point_value,
    admin_fee_criteria,
    minimum_point_can_used,
    title,
    description,
}: Props) => {
    const lastKeyTime = useRef(Date.now());
    const scannerTimer = useRef(null);
    const {
        data: form,
        setData: setForm,
        processing: formProcessing,
        errors: formErrors,
        setError: setFormError,
        clearErrors: clearFormErrors,
        reset: resetForm,
    } = useForm({
        is_new_customer: true,
        customer_id: "",
        customer_type: "",
        register_customer: {
            name: "",
            phone: "",
            address: "",
            type: "member",
        },
        payment_method: "",
        items: [] as {
            id: string;
            sku: string;
            product_name: string;
            attributes: {
                size: string;
                color: string;
            };
            stock_remaining: number;
            price_applied: number;
            price_criteria: {
                basic: number;
                reseller: number;
                order_qty_3: number;
                order_qty_6: number;
            };
            product_type: string;
            qty: number;
        }[],
        subtotal: 0,
        point_used: 0,
        point_earned: 0,
        discount: 0,
        admin_fee: 0,
        total: 0,
        on_scanning_printer: false,
    });
    const {
        data: skuFinder,
        setData: setSkuFinder,
        reset: resetSkuFinder,
    } = useForm({
        sku: "",
    });
    const {
        data: customerFinder,
        setData: setCustomerFinder,
        reset: resetCustomerFinder,
    } = useForm({
        customer_phone: "",
        is_found: false,
        customer_found: {
            id: null,
            name: "",
            phone: "",
            address: "",
            type: "",
            points: 0,
        },
    });

    const {
        data: pointUsedPlaceholder,
        setData: setPointUsedPlaceholder,
        reset: resetPointUsedPlaceholder,
    } = useForm({
        point_used_placeholder: 0,
    });

    const handleResetAll = () => {
        resetForm();
        resetSkuFinder();
        resetCustomerFinder();
        resetPointUsedPlaceholder();
    };

    const renderProductIcon = ({
        type,
        size = 24,
    }: {
        type: string;
        size?: number;
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

    const handlePriceItemByCriteria = () => {
        const currentCustomerType = form.is_new_customer
            ? form.register_customer.type
            : customerFinder.is_found
              ? customerFinder.customer_found.type
              : "member";

        const updatedItems = form.items.map((item) => {
            let price = item.price_criteria.basic;
            const qty = Number(item.qty);

            if (currentCustomerType === "reseller") {
                price = item.price_criteria.reseller;
            } else {
                if (qty >= 6) {
                    price = item.price_criteria.order_qty_6;
                } else if (qty >= 3) {
                    price = item.price_criteria.order_qty_3;
                } else {
                    price = item.price_criteria.basic;
                }
            }

            return { ...item, price_applied: price };
        });

        const isChanged = updatedItems.some(
            (item, index) =>
                item.price_applied !== form.items[index].price_applied,
        );

        if (isChanged) {
            setForm("items", updatedItems);
        }
    };

    const recalculateTransactionPayment = () => {
        const subtotal = form.items.reduce(
            (total, item) => total + item.price_applied * item.qty,
            0,
        );

        let point_earned = 0;
        form.items.forEach((item) => {
            if (item.price_applied * item.qty > eligible_point_minimum) {
                point_earned += 1;
            }
        });

        let admin_fee = 0;
        if (form.payment_method && Array.isArray(admin_fee_criteria)) {
            const criteria = admin_fee_criteria
                .filter((c: any) => c.payment_method === form.payment_method)
                .sort((a: any, b: any) => a.min_total - b.min_total);

            let matchedFee = 0;
            criteria.forEach((c: any) => {
                if (subtotal >= c.min_total) {
                    matchedFee = c.admin_fee;
                }
            });
            admin_fee = matchedFee;
        }
        const discount = Number(form.point_used) * Number(idr_point_value);
        const total = Number(subtotal) + Number(admin_fee) - Number(discount);

        setForm("subtotal", subtotal);
        setForm("admin_fee", admin_fee);
        setForm("discount", discount);
        setForm("total", total);
        setForm("point_earned", point_earned);
    };

    useEffect(() => {
        handlePriceItemByCriteria();
        recalculateTransactionPayment();
    }, [
        JSON.stringify(form.items),
        form.is_new_customer,
        customerFinder.is_found,
        form.payment_method,
        form.point_used,
    ]);
    const handleFindCustomer = (phone: string) => {
        axios
            .get("/admin/transactions/find/customer", {
                params: { phone },
            })
            .then((response) => {
                const customerData = response.data.customer;
                setCustomerFinder("is_found", true);
                setCustomerFinder("customer_found", customerData);
                setForm("customer_id", customerData.id);
                setForm("customer_type", customerData.type);
            })
            .catch((err) => {
                setCustomerFinder("is_found", false);
                BlastToaster("error", err.response.data.message);
            });
    };
    const handleFindSKU = (sku: string) => {
        const existingItem = form.items.find((item) => item.sku === sku);
        if (
            existingItem &&
            existingItem?.qty >= existingItem.stock_remaining!
        ) {
            BlastToaster("error", `Stok tidak mencukupi untuk SKU: ${sku}`);
            setSkuFinder("sku", "");
            return;
        }

        axios
            .get("/admin/transactions/find/sku", {
                params: { sku },
            })
            .then((response) => {
                const productVariantData = response.data.product_variant;
                const existingItemIndex = form.items.findIndex(
                    (item) => item.id === productVariantData.id,
                );
                let updatedItems = [...form.items];
                if (existingItemIndex !== -1) {
                    const existingItem = updatedItems[existingItemIndex];
                    updatedItems[existingItemIndex] = {
                        ...existingItem,
                        qty: existingItem.qty + 1,
                    };
                } else {
                    updatedItems.push({
                        id: productVariantData.id,
                        sku: productVariantData.sku,
                        product_name: productVariantData.product_name,
                        attributes: productVariantData.attributes,
                        price_applied: productVariantData.price_applied,
                        price_criteria: productVariantData.price_criteria,
                        product_type: productVariantData.product_type,
                        stock_remaining: productVariantData.stock_remaining,
                        qty: 1,
                    });
                }
                setSkuFinder("sku", "");
                setForm("items", updatedItems);
            })
            .catch((err) => {
                BlastToaster("error", err.response.data.message);
            });
    };

    const handleSubmitCustomer = (e: FormEvent) => {
        e.preventDefault();
        const phone = customerFinder.customer_phone || "";
        const numbersOnly = phone.replace(/\D/g, "");
        setCustomerFinder("customer_phone", numbersOnly);
        if (phone.trim() != "" && phone.length >= 8) {
            handleFindCustomer(numbersOnly);
        }
    };
    const handleSubmitSKU = (e: FormEvent) => {
        e.preventDefault();
        const sku = skuFinder.sku || "";
        const trimmedSKU = sku.trim();
        setSkuFinder("sku", trimmedSKU);
        if (trimmedSKU != "") {
            handleFindSKU(trimmedSKU);
        }
    };
    const handleQtyAction = (action: "ADD" | "MIN", index: number) => {
        if (action == "ADD") {
            const updatedItems = [...form.items];
            updatedItems[index].qty = updatedItems[index].qty + 1;
            setForm("items", updatedItems);
        } else if (action == "MIN") {
            const updatedItems = [...form.items];
            if (updatedItems[index].qty === 1) {
                updatedItems.splice(index, 1);
            } else {
                updatedItems[index].qty = updatedItems[index].qty - 1;
            }
            setForm("items", updatedItems);
        }
    };
    const savePointUsed = (value: number) => {
        setForm("point_used", value);
        setPointUsedPlaceholder("point_used_placeholder", value);
    };
    const validateForm = (): boolean => {
        clearFormErrors();
        let isValid = true;
        if (form.items.length == 0) {
            setFormError("items", "Keranjang tidak boleh kosong");
            isValid = false;
        }
        if (!form.payment_method) {
            setFormError("payment_method", "Metode pembayaran wajib dipilih");
            isValid = false;
        }

        return isValid;
    };
    const handleSubmitForm = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            BlastToaster("error", "Lengkapi seluruh form yang diwajibkan");
            return;
        }

        try {
            setForm("on_scanning_printer", true);
            const response = await axios.post("/admin/transactions", form);
            const { transaction_id, message } = response.data;

            const printResponse = await axios.get(
                `/admin/transactions/print/${transaction_id}`,
            );
            const { transaction: trxData, setting: settingData } =
                printResponse.data;

            const printer = new ReceiptPrinter();
            const bytes = printer.generateReceipt(trxData, settingData);

            // Direct Bluetooth Print
            await printer.printReceipt(bytes);

            BlastToaster(
                "success",
                message || "Transaksi berhasil & Struk dicetak",
            );
            handleResetAll();
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                Object.keys(errors).forEach((key) => {
                    setFormError(key as any, errors[key][0]);
                });
                BlastToaster("error", "Periksa kembali inputan anda");
            } else if (
                error.name === "NotFoundError" ||
                error.name === "SecurityError"
            ) {
                BlastToaster(
                    "success",
                    "Transaksi Berhasil Tanpa Cetak Struk.",
                );
                handleResetAll();
            } else {
                BlastToaster(
                    "error",
                    error.response?.data?.message ||
                        error.message ||
                        "Terjadi kesalahan",
                );
            }
        } finally {
            setForm("on_scanning_printer", false);
        }
    };

    return (
        <AppLayout>
            <div className="mb-4">
                <PageTitle title={title} description={description} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                <div className="w-full flex flex-col gap-4">
                    {/* SKU Input */}
                    <div className="flex flex-col">
                        <Label className="text-base mb-1">
                            Scan Barcode Produk
                        </Label>
                        <form onSubmit={handleSubmitSKU}>
                            <Input
                                autoFocus
                                type="text"
                                placeholder="Masukkan Barcode"
                                className="w-full"
                                disabled={form.on_scanning_printer}
                                value={skuFinder.sku || ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const currentTime = Date.now();

                                    const timeDiff =
                                        currentTime - lastKeyTime.current;
                                    setSkuFinder("sku", value);
                                    lastKeyTime.current = currentTime;
                                    if (scannerTimer.current)
                                        clearTimeout(scannerTimer.current);
                                    if (timeDiff < 60 && value.length > 2) {
                                        scannerTimer.current = setTimeout(
                                            () => {
                                                handleFindSKU(value);
                                            },
                                            200,
                                        ) as unknown as null;
                                    }
                                }}
                            />
                            <button type="submit" style={{ display: "none" }} />
                        </form>
                    </div>
                    {/* Customer Input */}
                    <div className="flex flex-col">
                        <Label className="text-base mb-1">Pelanggan</Label>
                        <div className="">
                            {!customerFinder.is_found ? (
                                <div className="flex flex-col lg:flex-row items-center w-full gap-2">
                                    <div className="w-full">
                                        <SelectSearchInput
                                            value={
                                                form.is_new_customer ? "1" : "0"
                                            }
                                            onChange={(value) =>
                                                setForm(
                                                    "is_new_customer",
                                                    value === "1",
                                                )
                                            }
                                            className="w-full"
                                            placeholder="Pilih Status Pelanggan"
                                            options={[
                                                {
                                                    label: "Baru",
                                                    value: "1",
                                                },
                                                {
                                                    label: "Yang sudah ada",
                                                    value: "0",
                                                },
                                            ]}
                                        />
                                    </div>
                                    {!form.is_new_customer ? (
                                        <form
                                            onSubmit={handleSubmitCustomer}
                                            className="w-full"
                                        >
                                            <Input
                                                type="text"
                                                placeholder="Cari No. Telepon"
                                                className="w-full"
                                                disabled={
                                                    form.on_scanning_printer
                                                }
                                                value={
                                                    customerFinder.customer_phone ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    setCustomerFinder(
                                                        "customer_phone",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <button
                                                disabled={
                                                    form.on_scanning_printer
                                                }
                                                type="submit"
                                                style={{ display: "none" }}
                                            />
                                        </form>
                                    ) : (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <div className="w-full">
                                                    <Button
                                                        className="w-full"
                                                        variant={"yellow"}
                                                        disabled={
                                                            form.on_scanning_printer
                                                        }
                                                    >
                                                        <CircleFadingPlus />
                                                        <span>
                                                            Form Pelanggan
                                                        </span>
                                                    </Button>
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-7xl">
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        Pelanggan Baru
                                                    </DialogTitle>
                                                    <DialogDescription className="mb-3">
                                                        Pelanggan baru sebagai
                                                        member
                                                    </DialogDescription>
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                                        <div className="flex flex-col w-full">
                                                            <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                                Nama Lengkap
                                                            </label>
                                                            <Input
                                                                type="text"
                                                                placeholder="Masukkan Nama Lengkap"
                                                                className="w-full"
                                                                disabled={
                                                                    form.on_scanning_printer
                                                                }
                                                                value={
                                                                    form
                                                                        .register_customer
                                                                        .name ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    setForm(
                                                                        "register_customer",
                                                                        {
                                                                            ...form.register_customer,
                                                                            name: e
                                                                                .target
                                                                                .value,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                            {formErrors[
                                                                "register_customer.name"
                                                            ] && (
                                                                <ErrorInput
                                                                    error={
                                                                        formErrors[
                                                                            "register_customer.name"
                                                                        ]
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col w-full">
                                                            <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                                No HP
                                                            </label>
                                                            <Input
                                                                type="tel"
                                                                placeholder="Masukkan No Telp"
                                                                className="w-full"
                                                                disabled={
                                                                    form.on_scanning_printer
                                                                }
                                                                value={
                                                                    form
                                                                        .register_customer
                                                                        .phone ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    setForm(
                                                                        "register_customer",
                                                                        {
                                                                            ...form.register_customer,
                                                                            phone: e
                                                                                .target
                                                                                .value,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                            {formErrors[
                                                                "register_customer.phone"
                                                            ] && (
                                                                <ErrorInput
                                                                    error={
                                                                        formErrors[
                                                                            "register_customer.phone"
                                                                        ]
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col w-full">
                                                            <label className="text-base mb-1">
                                                                Alamat
                                                            </label>
                                                            <Textarea
                                                                placeholder="Masukkan Alamat"
                                                                disabled={
                                                                    form.on_scanning_printer
                                                                }
                                                                value={
                                                                    form
                                                                        .register_customer
                                                                        .address ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    setForm(
                                                                        "register_customer",
                                                                        {
                                                                            ...form.register_customer,
                                                                            address:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </DialogHeader>
                                                <DialogFooter className="mt-9">
                                                    <DialogClose asChild>
                                                        <Button
                                                            variant="yellow"
                                                            disabled={
                                                                form.on_scanning_printer
                                                            }
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Save /> Simpan
                                                        </Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            ) : (
                                // Customer Found
                                <div className="w-full p-4 border border-green-500 rounded-lg bg-green-50">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold">
                                                    {
                                                        customerFinder
                                                            .customer_found.name
                                                    }
                                                </h3>
                                                <Badge>
                                                    {humanCustType(
                                                        customerFinder
                                                            .customer_found
                                                            .type,
                                                    )}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm flex items-center gap-2">
                                                    <Phone size={14} />
                                                    <span>
                                                        {
                                                            customerFinder
                                                                .customer_found
                                                                .phone
                                                        }
                                                    </span>
                                                </p>
                                                <p className="text-sm flex items-center gap-2">
                                                    <Coins size={14} />
                                                    <span>
                                                        {
                                                            customerFinder
                                                                .customer_found
                                                                .points
                                                        }{" "}
                                                        Poin
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="red"
                                            size="icon"
                                            disabled={form.on_scanning_printer}
                                            onClick={() => {
                                                setCustomerFinder(
                                                    "is_found",
                                                    false,
                                                );
                                                setCustomerFinder(
                                                    "customer_phone",
                                                    "",
                                                );
                                            }}
                                        >
                                            <X />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Cart */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                Keranjang
                            </Label>
                            {formErrors["items"] && (
                                <ErrorInput
                                    error={formErrors["items"]}
                                    afterLabel={true}
                                />
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-[230px] overflow-y-auto">
                            {form.items.length == 0 && (
                                <div className="border w-full rounded-md col-span-2 gap-3 px-1.5 py-3 flex flex-col justify-center items-center min-h-[100px]">
                                    <div className="flex items-center justify-center w-full h-full">
                                        {renderProductIcon({
                                            type: "package",
                                            size: 32,
                                        })}
                                    </div>
                                    <p className="text-sm">
                                        Keranjang masih kosong
                                    </p>
                                </div>
                            )}
                            {/*Item list with card*/}
                            {form.items.length > 0 &&
                                form.items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="border w-full rounded-md relative overflow-hidden px-1.5 py-3"
                                    >
                                        <div className="flex gap-2 min-h-5">
                                            {/*Icon*/}
                                            <div className="h-full absolute left-0 top-0 p-3  bg-pink-200">
                                                <div className="flex items-center justify-center w-full h-full">
                                                    {renderProductIcon({
                                                        type: item.product_type,
                                                    })}
                                                </div>
                                            </div>
                                            <div className="ms-15 flex flex-col items-start w-full">
                                                {/*Product Name*/}
                                                <p className="">
                                                    {item.product_name}
                                                </p>
                                                <div className="flex gap-1">
                                                    <span className="text-xs">
                                                        {item.attributes.color}
                                                    </span>
                                                    {item.product_type ==
                                                        "sepatu" && (
                                                        <span className="text-xs">
                                                            {" | "}
                                                            {
                                                                item.attributes
                                                                    .size
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="font-semibold">
                                                    {floatToIdCurrency(
                                                        item.price_applied,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 me-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => {
                                                        handleQtyAction(
                                                            "MIN",
                                                            index,
                                                        );
                                                    }}
                                                    disabled={
                                                        form.on_scanning_printer
                                                    }
                                                    aria-label="Kurangi Qty"
                                                >
                                                    -
                                                </Button>
                                                <span className="px-3">
                                                    {item.qty}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => {
                                                        handleQtyAction(
                                                            "ADD",
                                                            index,
                                                        );
                                                    }}
                                                    disabled={
                                                        form.on_scanning_printer
                                                    }
                                                    aria-label="Tambah Qty"
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col gap-4">
                    {/*Payment Method*/}
                    <div className="flex flex-col">
                        <div className="flex items-start gap-2">
                            <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                Metode Pembayaran
                            </Label>
                            {formErrors["payment_method"] && (
                                <ErrorInput
                                    error={formErrors["payment_method"]}
                                    afterLabel={true}
                                />
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                disabled={form.on_scanning_printer}
                                variant={
                                    form.payment_method === "cash"
                                        ? "pink"
                                        : "outline"
                                }
                                className={`flex-1 `}
                                onClick={() =>
                                    setForm("payment_method", "cash")
                                }
                            >
                                Tunai
                            </Button>
                            <Button
                                type="button"
                                disabled={form.on_scanning_printer}
                                variant={
                                    form.payment_method === "transfer"
                                        ? "pink"
                                        : "outline"
                                }
                                className={`flex-1`}
                                onClick={() =>
                                    setForm("payment_method", "transfer")
                                }
                            >
                                Transfer
                            </Button>
                            <Button
                                type="button"
                                disabled={form.on_scanning_printer}
                                variant={
                                    form.payment_method === "qris"
                                        ? "pink"
                                        : "outline"
                                }
                                className={`flex-1`}
                                onClick={() =>
                                    setForm("payment_method", "qris")
                                }
                            >
                                QRIS
                            </Button>
                        </div>
                    </div>

                    {/*Total Info*/}
                    <div className="flex flex-col">
                        <Label className="text-base mb-1">
                            Informasi Pembayaran
                        </Label>
                        <Card className="relative py-3 overflow-y-auto">
                            <CardContent className="px-3 flex flex-col gap-3">
                                <Dialog>
                                    <DialogTrigger
                                        hidden={
                                            (customerFinder.customer_found
                                                ?.points ?? 0) +
                                                form.point_earned <
                                            minimum_point_can_used
                                        }
                                        asChild
                                    >
                                        <div className="w-full">
                                            <Button
                                                onClick={() => {
                                                    if (
                                                        pointUsedPlaceholder.point_used_placeholder >
                                                        0
                                                    ) {
                                                        setPointUsedPlaceholder(
                                                            "point_used_placeholder",
                                                            form.point_used,
                                                        );
                                                    } else {
                                                        setPointUsedPlaceholder(
                                                            "point_used_placeholder",
                                                            minimum_point_can_used,
                                                        );
                                                    }
                                                }}
                                                className="w-full"
                                                variant={"green"}
                                                disabled={
                                                    form.on_scanning_printer
                                                }
                                            >
                                                <Coins />
                                                <span>Gunakan Poin</span>
                                            </Button>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-7xl">
                                        <DialogHeader>
                                            <DialogTitle>
                                                Gunakan poin
                                            </DialogTitle>
                                            <DialogDescription className="mb-3">
                                                Gunakan poin sebagai diskon
                                                senilai{" "}
                                                {floatToIdCurrency(
                                                    idr_point_value,
                                                )}
                                            </DialogDescription>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                                <div className="flex flex-col w-full">
                                                    <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                        Poin yang dapat
                                                        digunakan
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        disabled={
                                                            form.on_scanning_printer
                                                        }
                                                        placeholder="Masukkan poin"
                                                        className="w-full"
                                                        id="input_point_used"
                                                        min={
                                                            minimum_point_can_used
                                                        }
                                                        max={
                                                            (customerFinder
                                                                .customer_found
                                                                ?.points ?? 0) +
                                                            form.point_earned
                                                        }
                                                        onChange={(e) => {
                                                            let val = Number(
                                                                e.target.value,
                                                            );
                                                            const min =
                                                                minimum_point_can_used;
                                                            const max =
                                                                (customerFinder
                                                                    .customer_found
                                                                    ?.points ??
                                                                    0) +
                                                                form.point_earned;
                                                            if (val < min)
                                                                val = min;
                                                            if (val > max)
                                                                val = max;
                                                            setPointUsedPlaceholder(
                                                                "point_used_placeholder",
                                                                val,
                                                            );
                                                        }}
                                                        value={
                                                            pointUsedPlaceholder.point_used_placeholder
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </DialogHeader>
                                        <DialogFooter className="mt-9">
                                            <DialogClose asChild>
                                                <Button
                                                    variant="red"
                                                    type="button"
                                                    disabled={
                                                        form.on_scanning_printer
                                                    }
                                                    className="flex items-center gap-2"
                                                    onClick={() => {
                                                        setPointUsedPlaceholder(
                                                            "point_used_placeholder",
                                                            0,
                                                        );
                                                        setForm(
                                                            "point_used",
                                                            0,
                                                        );
                                                    }}
                                                >
                                                    <X /> Batalkan
                                                </Button>
                                            </DialogClose>
                                            <DialogClose asChild>
                                                <Button
                                                    variant="yellow"
                                                    disabled={
                                                        form.on_scanning_printer
                                                    }
                                                    type="button"
                                                    onClick={() => {
                                                        const input =
                                                            document.getElementById(
                                                                "input_point_used",
                                                            ) as HTMLInputElement | null;
                                                        if (input) {
                                                            savePointUsed(
                                                                Number(
                                                                    input.value,
                                                                ),
                                                            );
                                                        }
                                                    }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <TicketPercent /> Gunakan
                                                </Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Subtotal
                                        </span>
                                        <span className="font-medium">
                                            {floatToIdCurrency(form.subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Poin Didapat
                                        </span>
                                        <span className="font-medium">
                                            {form.point_earned}
                                        </span>
                                    </div>
                                    <div className="border-t"></div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Biaya Admin
                                        </span>
                                        <span className="font-medium">
                                            {floatToIdCurrency(form.admin_fee)}
                                        </span>
                                    </div>
                                    <div className="border-t"></div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Poin Digunakan
                                        </span>
                                        <span className="font-medium">
                                            {form.point_used}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Diskon
                                        </span>
                                        <span className="font-medium">
                                            {floatToIdCurrency(form.discount)}
                                        </span>
                                    </div>
                                    <div className="border-t my-2"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold">
                                            Total
                                        </span>
                                        <span className="text-lg font-bold text-green-700">
                                            {floatToIdCurrency(form.total)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/*Btn submit*/}
                    <Button
                        variant={"yellow"}
                        size={"lg"}
                        disabled={form.on_scanning_printer || formProcessing}
                        onClick={handleSubmitForm}
                    >
                        {formProcessing || form.on_scanning_printer ? (
                            <Loader className="animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save /> <span>Simpan Transaksi</span>
                            </div>
                        )}
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
};

export default AdminTransactionCreate;
