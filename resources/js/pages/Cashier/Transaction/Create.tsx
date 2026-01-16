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

const CashierTransactionCreate = ({
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
            with_price_criteria: boolean;
            can_earn_point: boolean;
            qty: number;
        }[],
        subtotal: 0,
        point_used: 0,
        point_earned: 0,
        point_discount: 0,
        event_discount: 0,
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
        is_multiple_found: false,
        multiple_found_items: [] as {
            id: string;
            sku: string;
            product_name: string;
            attributes: {
                size: string;
                color: string;
            };
            price_applied: number;
            price_criteria: {
                basic: number;
                reseller: number;
                order_qty_3: number;
                order_qty_6: number;
            };
            product_type: string;
            with_price_criteria: boolean;
            can_earn_point: boolean;
            stock_remaining: number;
            qty: number;
        }[],
    });
    const {
        data: customerFinder,
        setData: setCustomerFinder,
        reset: resetCustomerFinder,
    } = useForm({
        customer_find: "",
        is_multiple_found: false,
        multiple_found_items: [] as {
            id: number | string | undefined | null;
            name: string;
            phone: string;
            address: string;
            type: string;
            points: number;
        }[],
        is_found: false,
        customer_found: {
            id: null as number | string | null | undefined,
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

        const shouldUseMultiItemDiscount =
            form.items.length > 1 &&
            currentCustomerType !== "reseller" &&
            form.items.some((item) => item.with_price_criteria);

        let updatedItems;

        if (shouldUseMultiItemDiscount) {
            const totalAllQty = form.items.reduce((sum, item) => {
                return sum + (Number(item.qty) || 0);
            }, 0);

            const differences: number[] = [];

            form.items.forEach((item) => {
                if (!item.with_price_criteria) return;

                const basicPrice = Number(item.price_criteria.basic);
                let applicablePrice = basicPrice;

                if (totalAllQty >= 6) {
                    applicablePrice = Number(item.price_criteria.order_qty_6);
                } else if (totalAllQty >= 3) {
                    applicablePrice = Number(item.price_criteria.order_qty_3);
                }

                const diff = basicPrice - applicablePrice;
                differences.push(diff);
            });

            const lowestDiff =
                differences.length > 0 ? Math.min(...differences) : 0;

            updatedItems = form.items.map((item) => {
                let price = Number(item.price_criteria.basic);

                if (item.with_price_criteria && lowestDiff > 0) {
                    price = Number(item.price_criteria.basic) - lowestDiff;
                }

                return { ...item, price_applied: price };
            });
        } else {
            updatedItems = form.items.map((item) => {
                let price = Number(item.price_criteria.basic);
                const qty = Number(item.qty);

                if (item.with_price_criteria) {
                    if (currentCustomerType === "reseller") {
                        price = Number(item.price_criteria.reseller);
                    } else {
                        if (qty >= 6) {
                            price = Number(item.price_criteria.order_qty_6);
                        } else if (qty >= 3) {
                            price = Number(item.price_criteria.order_qty_3);
                        }
                    }
                }

                return { ...item, price_applied: price };
            });
        }

        const isChanged = updatedItems.some(
            (item, index) =>
                Number(item.price_applied) !==
                Number(form.items[index].price_applied),
        );

        if (isChanged) {
            setForm("items", updatedItems);
        }
    };

    const recalculateTransactionPayment = () => {
        const subtotal = form.items.reduce(
            (total, item) =>
                total + Number(item.price_applied) * Number(item.qty),
            0,
        );

        let point_earned = 0;
        form.items.forEach((item) => {
            if (
                item.can_earn_point &&
                Number(item.price_applied) * Number(item.qty) >=
                    Number(eligible_point_minimum)
            ) {
                if (
                    Number(item.price_applied) < Number(eligible_point_minimum)
                ) {
                    point_earned += Math.floor(
                        (Number(item.price_applied) * Number(item.qty)) /
                            Number(eligible_point_minimum),
                    );
                } else {
                    point_earned += Number(item.qty);
                }
            }
        });

        let admin_fee = 0;
        if (form.payment_method && Array.isArray(admin_fee_criteria)) {
            const criteria = admin_fee_criteria
                .filter((c: any) => c.payment_method === form.payment_method)
                .sort(
                    (a: any, b: any) =>
                        Number(a.min_total) - Number(b.min_total),
                );

            let matchedFee = 0;
            criteria.forEach((c: any) => {
                if (Number(subtotal) >= Number(c.min_total)) {
                    matchedFee = Number(c.admin_fee);
                }
            });
            admin_fee = matchedFee;
        }
        const point_discount =
            Number(form.point_used) * Number(idr_point_value);
        const event_discount = Number(form.event_discount);
        const total =
            Number(subtotal) +
            Number(admin_fee) -
            Number(point_discount) -
            Number(event_discount);

        setForm("subtotal", subtotal);
        setForm("admin_fee", admin_fee);
        setForm("point_discount", point_discount);
        setForm("event_discount", event_discount);
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
        form.event_discount,
    ]);
    const handleFindCustomer = (phone: string) => {
        axios
            .get("/cashier/transactions/find/customer", {
                params: { phone },
            })
            .then((response) => {
                const customerData = response.data;

                if (Array.isArray(customerData) && customerData.length > 1) {
                    setCustomerFinder("is_multiple_found", true);
                    setCustomerFinder("multiple_found_items", customerData);
                    return;
                }

                const singleCustomer = Array.isArray(customerData)
                    ? customerData[0]
                    : customerData;

                setCustomerFinder("is_found", true);
                setCustomerFinder("customer_found", singleCustomer);
                setForm("customer_id", singleCustomer.id);
                setForm("customer_type", singleCustomer.type);
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
            BlastToaster("error", `Stok tidak mencukupi untuk ${sku}`);
            setSkuFinder("sku", "");
            return;
        }

        axios
            .get("/cashier/transactions/find/sku", {
                params: { sku },
            })
            .then((response) => {
                const productVariantData = response.data;

                if (
                    Array.isArray(productVariantData) &&
                    productVariantData.length > 1
                ) {
                    setSkuFinder("is_multiple_found", true);
                    setSkuFinder("multiple_found_items", productVariantData);
                    setSkuFinder("sku", "");
                    return;
                }

                const singleProduct = Array.isArray(productVariantData)
                    ? productVariantData[0]
                    : productVariantData;

                const existingItemIndex = form.items.findIndex(
                    (item) => item.id === singleProduct.id,
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
                        id: singleProduct.id,
                        sku: singleProduct.sku,
                        product_name: singleProduct.product_name,
                        attributes: singleProduct.attributes,
                        price_applied: singleProduct.price_applied,
                        price_criteria: singleProduct.price_criteria,
                        product_type: singleProduct.product_type,
                        with_price_criteria: singleProduct.with_price_criteria,
                        can_earn_point: singleProduct.can_earn_point,
                        stock_remaining: singleProduct.stock_remaining,
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
        const value = customerFinder.customer_find || "";
        setCustomerFinder("customer_find", value);
        handleFindCustomer(value);
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
            if (
                updatedItems[index].stock_remaining &&
                updatedItems[index].qty >= updatedItems[index].stock_remaining
            ) {
                BlastToaster(
                    "error",
                    `Stok tidak mencukupi untuk ${updatedItems[index].sku}`,
                );
                return;
            }
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
        handlePriceItemByCriteria();
        recalculateTransactionPayment();
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

        if (form.register_customer.name || form.register_customer.phone) {
            if (!form.register_customer.name) {
                setFormError("register_customer.name", "Nama wajib diisi");
                setFormError(
                    "register_customer",
                    "Data pelanggan tidak lengkap",
                );
                isValid = false;
            }
            if (!form.register_customer.phone) {
                setFormError("register_customer.phone", "No HP wajib diisi");
                setFormError(
                    "register_customer",
                    "Data pelanggan tidak lengkap",
                );
                isValid = false;
            }
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
            const response = await axios.post("/cashier/transactions", form);
            const { transaction_id, message } = response.data;

            const printResponse = await axios.get(
                `/cashier/transactions/print/${transaction_id}`,
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
                    {/*Modal IF product found more than 1*/}
                    <Dialog
                        open={skuFinder.is_multiple_found}
                        onOpenChange={(open) => {
                            setSkuFinder(
                                "is_multiple_found",
                                !skuFinder.is_multiple_found,
                            );
                            setSkuFinder("multiple_found_items", []);
                            return open;
                        }}
                    >
                        <DialogContent className="sm:max-w-8xl max-h-96 overflow-y-auto">
                            <DialogTitle>Pilih varian produk</DialogTitle>
                            <DialogDescription className="mb-3">
                                Pilih satu untuk masuk ke keranjang
                            </DialogDescription>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {skuFinder.multiple_found_items.map(
                                    (item, index) => (
                                        <Card
                                            tabIndex={index}
                                            key={index}
                                            onClick={() => {
                                                const existingItem =
                                                    form.items.find(
                                                        (i) => i.id === item.id,
                                                    );
                                                if (
                                                    existingItem &&
                                                    existingItem.qty >=
                                                        existingItem.stock_remaining
                                                ) {
                                                    BlastToaster(
                                                        "error",
                                                        `Stok tidak mencukupi untuk ${item.sku}`,
                                                    );
                                                    setSkuFinder(
                                                        "is_multiple_found",
                                                        false,
                                                    );
                                                    setSkuFinder(
                                                        "multiple_found_items",
                                                        [],
                                                    );
                                                    return;
                                                }

                                                const existingItemIndex =
                                                    form.items.findIndex(
                                                        (i) => i.id === item.id,
                                                    );
                                                let updatedItems = [
                                                    ...form.items,
                                                ];
                                                if (existingItemIndex !== -1) {
                                                    const existingItem =
                                                        updatedItems[
                                                            existingItemIndex
                                                        ];
                                                    updatedItems[
                                                        existingItemIndex
                                                    ] = {
                                                        ...existingItem,
                                                        qty:
                                                            existingItem.qty +
                                                            1,
                                                    };
                                                } else {
                                                    updatedItems.push({
                                                        id: item.id,
                                                        sku: item.sku,
                                                        product_name:
                                                            item.product_name,
                                                        attributes:
                                                            item.attributes,
                                                        price_applied:
                                                            item.price_applied,
                                                        price_criteria:
                                                            item.price_criteria,
                                                        product_type:
                                                            item.product_type,
                                                        with_price_criteria:
                                                            item.with_price_criteria,
                                                        can_earn_point:
                                                            item.can_earn_point,
                                                        stock_remaining:
                                                            item.stock_remaining,
                                                        qty: 1,
                                                    });
                                                }
                                                setForm("items", updatedItems);
                                                setSkuFinder(
                                                    "is_multiple_found",
                                                    false,
                                                );
                                                setSkuFinder(
                                                    "multiple_found_items",
                                                    [],
                                                );
                                            }}
                                            className="relative py-3 overflow-hidden cursor-pointer"
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
                                                            {renderProductIcon({
                                                                type:
                                                                    item.product_type ||
                                                                    "",
                                                                size: 16,
                                                            })}
                                                            <span>
                                                                {
                                                                    item.product_name
                                                                }
                                                            </span>
                                                        </Badge>
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm">
                                                            Warna{" "}
                                                            {item.attributes
                                                                ?.color ?? "-"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm">
                                                            Ukuran{" "}
                                                            {item.attributes
                                                                ?.size ?? "-"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ),
                                )}
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button
                                        variant="red"
                                        type="button"
                                        className="flex items-center gap-2"
                                    >
                                        <X /> Batal
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    {/*Modal IF customer found more than 1*/}
                    <Dialog
                        open={customerFinder.is_multiple_found}
                        onOpenChange={(open) => {
                            setCustomerFinder(
                                "is_multiple_found",
                                !customerFinder.is_multiple_found,
                            );
                            setCustomerFinder("multiple_found_items", []);
                            return open;
                        }}
                    >
                        <DialogContent className="sm:max-w-8xl max-h-96 overflow-y-auto">
                            <DialogTitle>Pilih pelanggan</DialogTitle>
                            <DialogDescription className="mb-3">
                                Pilih satu pelanggan yang sesuai
                            </DialogDescription>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {customerFinder.multiple_found_items.map(
                                    (item, index) => (
                                        <Card
                                            tabIndex={index}
                                            key={index}
                                            onClick={() => {
                                                setCustomerFinder(
                                                    "is_found",
                                                    true,
                                                );
                                                setCustomerFinder(
                                                    "customer_found",
                                                    item,
                                                );
                                                setForm(
                                                    "customer_id",
                                                    item.id as string,
                                                );
                                                setForm(
                                                    "customer_type",
                                                    item.type,
                                                );
                                                setCustomerFinder(
                                                    "is_multiple_found",
                                                    false,
                                                );
                                                setCustomerFinder(
                                                    "multiple_found_items",
                                                    [],
                                                );
                                            }}
                                            className="relative py-3 overflow-hidden cursor-pointer"
                                        >
                                            <CardContent className="px-3 z-10">
                                                <div className="flex flex-col mb-3">
                                                    <h3 className="font-semibold text-md">
                                                        {item.name}
                                                    </h3>
                                                    <span className="text-xs text-gray-600">
                                                        <Badge
                                                            variant="outline"
                                                            className="me-2 z-0 flex"
                                                        >
                                                            <span>
                                                                {humanCustType(
                                                                    item.type,
                                                                )}
                                                            </span>
                                                        </Badge>
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm">
                                                            No.Hp {item.phone}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm">
                                                            Poin {item.points}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ),
                                )}
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button
                                        variant="red"
                                        type="button"
                                        className="flex items-center gap-2"
                                    >
                                        <X /> Batal
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    {/* SKU Input */}
                    <div className="flex flex-col">
                        <Label className="text-base mb-1">
                            Scan Barcode / Cari Produk
                        </Label>
                        <form onSubmit={handleSubmitSKU}>
                            <Input
                                autoFocus
                                type="text"
                                placeholder="Masukkan pencarian"
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
                                    if (timeDiff < 40 && value.length > 2) {
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
                        <div className="flex items-center gap-2">
                            <Label className="text-base mb-1">Pelanggan</Label>
                            {formErrors["register_customer"] && (
                                <ErrorInput
                                    error={formErrors["register_customer"]}
                                    afterLabel={true}
                                />
                            )}
                        </div>
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
                                                    label: "Baru / Umum",
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
                                                placeholder="Cari nama atau no hp"
                                                className="w-full"
                                                disabled={
                                                    form.on_scanning_printer
                                                }
                                                value={
                                                    customerFinder.customer_find ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    setCustomerFinder(
                                                        "customer_find",
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
                                                    "customer_find",
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
                                                        <pre>
                                                            {"(" +
                                                                item.sku +
                                                                ")"}
                                                        </pre>
                                                    </span>
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

                    {/*Event Direct Discount*/}
                    <div className="flex flex-col">
                        <div className="flex items-start gap-2">
                            <Label className="text-base mb-1">
                                Gunakan Diskon Event
                            </Label>
                            {formErrors["event_discount"] && (
                                <ErrorInput
                                    error={formErrors["event_discount"]}
                                    afterLabel={true}
                                />
                            )}
                        </div>
                        <Input
                            type="number"
                            placeholder="Masukkan nominal"
                            className="w-full bg-white"
                            disabled={form.on_scanning_printer}
                            min={0}
                            value={form.event_discount || ""}
                            onChange={(e) => {
                                const inputValue = Number(e.target.value);
                                const clampedValue = Math.max(0, inputValue);

                                const maxAllowedDiscount =
                                    Number(form.subtotal) +
                                    Number(form.admin_fee) -
                                    Number(form.point_discount);

                                const finalValue = Math.min(
                                    clampedValue,
                                    maxAllowedDiscount,
                                );

                                setForm("event_discount", finalValue);
                            }}
                        />
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
                                            Poin pelanggan
                                        </span>
                                        <span className="font-medium">
                                            + {form.point_earned} / -{" "}
                                            {form.point_used}
                                        </span>
                                    </div>
                                    <div className="border-t"></div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Konversi poin
                                        </span>
                                        <span className="font-medium">
                                            {floatToIdCurrency(
                                                form.point_discount,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Diskon event
                                        </span>
                                        <span className="font-medium">
                                            {floatToIdCurrency(
                                                form.event_discount,
                                            )}
                                        </span>
                                    </div>
                                    <div className="border-t"></div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Biaya admin
                                        </span>
                                        <span className="font-medium">
                                            {floatToIdCurrency(form.admin_fee)}
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

export default CashierTransactionCreate;
