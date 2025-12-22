import { ErrorInput, SelectSearchInput } from "@/components/custom/FormElement";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/Partials/PageTitle";
import { TransactionCreateProps } from "@/types/transaction";
import { useForm } from "@inertiajs/react";
import { useEffect, useMemo } from "react";
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
import {
    CircleFadingPlus,
    Coins,
    Footprints,
    Handbag,
    Package,
    Phone,
    Save,
    Sparkles,
    X,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import BlastToaster from "@/components/custom/BlastToaster";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { humanCustType } from "@/components/helper/helper";
type Props = PageTitleProps & TransactionCreateProps;

const AdminTransactionCreate = ({
    eligible_point_minimum,
    admin_fee_criteria,
    title,
    description,
}: Props) => {
    const {
        data: form,
        setData: setForm,
        processing: formProcessing,
        errors: formErrors,
        setError: setFormError,
        post: formPost,
    } = useForm({
        is_new_customer: false,
        customer_id: "",
        customer_type: "",
        customer_new: {
            name: "",
            phone: "",
            address: "",
            type: "member",
        },
        payment_method: "",
        items: [
            {
                id: "",
                mode: "PLACEHOLDER",
                sku: "",
                product_name: "",
                attributes: {
                    size: "",
                    color: "",
                },
                price_applied: 0,
                price_criteria: {
                    basic: 0,
                    resell: 0,
                    order_qty_3: 0,
                    order_qty_6: 0,
                },
                product_type: "",
                qty: 1,
            },
        ],
        subtotal: 0,
        point_used: 0,
        point_earned: 0,
        discount: 0,
        admin_fee: 0,
        total: 0,
    });
    const { data: skuFinder, setData: setSkuFinder } = useForm({
        sku: "",
    });
    const { data: customerFinder, setData: setCustomerFinder } = useForm({
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
    const ModalNewCustomer = () => {
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="w-full lg:w-fit" variant={"yellow"}>
                        <CircleFadingPlus />
                        <span>Form Pelanggan</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-7xl">
                    <DialogHeader>
                        <DialogTitle>Pelanggan Baru</DialogTitle>
                        <DialogDescription className="mb-3">
                            Pelanggan akan langsung disimpan sebagai member
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
                                    value={form.customer_new.name || ""}
                                    onChange={(e) =>
                                        setForm("customer_new", {
                                            ...form.customer_new,
                                            name: e.target.value,
                                        })
                                    }
                                />
                                {formErrors["customer_new.name"] && (
                                    <ErrorInput
                                        error={formErrors["customer_new.name"]}
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
                                    value={form.customer_new.phone || ""}
                                    onChange={(e) =>
                                        setForm("customer_new", {
                                            ...form.customer_new,
                                            phone: e.target.value,
                                        })
                                    }
                                />
                                {formErrors["customer_new.phone"] && (
                                    <ErrorInput
                                        error={formErrors["customer_new.phone"]}
                                    />
                                )}
                            </div>
                            <div className="flex flex-col w-full">
                                <label className="text-base mb-1">Alamat</label>
                                <Textarea
                                    placeholder="Masukkan Alamat"
                                    value={form.customer_new.address || ""}
                                    onChange={(e) =>
                                        setForm("customer_new", {
                                            ...form.customer_new,
                                            address: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="mt-9">
                        <DialogClose asChild>
                            <Button
                                variant="yellow"
                                className="flex items-center gap-2"
                            >
                                <Save /> Simpan
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    const renderProductIcon = ({
        type,
        size = 24,
    }: {
        type: string;
        size?: number;
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

    const createDebouncedFetcher = (
        url: string,
        paramKey: string,
        onSuccess: (data: any) => void,
        errorMessage: string,
    ) => {
        let timeoutId: NodeJS.Timeout;
        return (value: string) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                axios
                    .get(url, {
                        params: { [paramKey]: value },
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                        },
                    })
                    .then((response) => onSuccess(response.data))
                    .catch(() => {
                        BlastToaster("error", errorMessage);
                    });
            }, 1000);
        };
    };

    const debounceFindCustomer = useMemo(
        () =>
            createDebouncedFetcher(
                "/admin/transactions/find/customer",
                "phone",
                (data) => {
                    setCustomerFinder((prev) => ({
                        ...prev,
                        is_found: true,
                        customer_found: data.customer,
                    }));
                },
                "Pelanggan tidak ditemukan",
            ),
        [],
    );

    const handlePriceItemByCriteria = () => {
        const currentCustomerType = form.is_new_customer
            ? form.customer_new.type
            : customerFinder.is_found
              ? customerFinder.customer_found.type
              : "member";

        const updatedItems = form.items.map((item) => {
            let price = item.price_criteria.basic;
            const qty = Number(item.qty);

            if (currentCustomerType === "reseller") {
                price = item.price_criteria.resell;
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

    useEffect(() => {
        handlePriceItemByCriteria();
    }, [form.items]);

    const debounceFindSKU = useMemo(
        () =>
            createDebouncedFetcher(
                "/admin/transactions/find/sku",
                "sku",
                (data) => {
                    setForm((prev) => ({
                        ...prev,
                        items: [
                            ...prev.items,
                            { ...data.product_variant, mode: "PRODUCT" },
                        ],
                    }));
                },
                "Produk tidak ditemukan",
            ),
        [],
    );
    const handleFindCustomer = (phone: string) => {
        const numbersOnly = phone.replace(/\D/g, "");
        setCustomerFinder("customer_phone", numbersOnly);
        if (phone.trim() != "" && phone.length >= 8) {
            debounceFindCustomer(numbersOnly);
        }
    };
    const handleFindSKU = (sku: string) => {
        const trimmedSKU = sku.trim();
        setSkuFinder("sku", trimmedSKU);
        if (trimmedSKU != "") {
            debounceFindSKU(trimmedSKU);
        }
    };
    return (
        <AppLayout>
            <div className="mb-4">
                <PageTitle title={title} description={description} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="w-full flex flex-col gap-3">
                    {/* SKU Input */}
                    <div className="flex flex-col">
                        <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Scan Barcode Produk
                        </Label>
                        <Input
                            autoFocus
                            type="text"
                            placeholder="Masukkan Barcode"
                            className="w-full"
                            value={skuFinder.sku || ""}
                            onChange={(e) => handleFindSKU(e.target.value)}
                        />
                    </div>
                    {/* Customer Input */}
                    <div className="flex flex-col">
                        <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Pelanggan
                        </Label>
                        <div className="">
                            {!customerFinder.is_found ? (
                                <div className="flex flex-col lg:flex-row items-center gap-2">
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
                                        <Input
                                            type="text"
                                            placeholder="Cari No. Telepon"
                                            className="w-full"
                                            value={
                                                customerFinder.customer_phone ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleFindCustomer(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    ) : (
                                        <ModalNewCustomer />
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
                        <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Keranjang
                        </Label>
                        <div className="flex flex-col gap-2">
                            {/*Item list with card*/}
                            {form.items.length > 0 &&
                                form.items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="border w-full rounded-md relative overflow-hidden px-1.5 py-3"
                                    >
                                        <div className="flex gap-2 h-min-[300px]">
                                            {/*Icon*/}
                                            <div className="h-full absolute left-0 top-0 p-3  bg-pink-300">
                                                {renderProductIcon({
                                                    type: item.product_type,
                                                })}
                                            </div>
                                            <div className="ms-15">
                                                <p>A</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default AdminTransactionCreate;
