import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CircleFadingPlus, Save, X } from "lucide-react";
import { SelectOption } from "@/types/global";
import { inputDebounce } from "@/components/helper/helper";
import axios from "axios";
import BlastToaster from "@/components/custom/BlastToaster";
import {
    DatePickerInput,
    ErrorInput,
    SelectSearchInput,
} from "@/components/custom/FormElement";

const AdminProductRejectCreate = () => {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        setError,
    } = useForm({
        variant_id: "",
        quantity: "",
        reason: "",
        rejected_at: new Date().toISOString().split("T")[0],
    });
    const { data: variantOptions, setData: setVariantOptions } = useForm({
        variants: [] as SelectOption[],
    });
    const debounceVariantSearch = inputDebounce((variant, setOptions) => {
        axios
            .get("/admin/product-rejects/find-variant", {
                params: { search: variant },
            })
            .then((response) => {
                setVariantOptions("variants", response.data || []);
                if (typeof setOptions === "function") {
                    setOptions(response.data || []);
                }
            })
            .catch(() => {
                BlastToaster("error", "Produk tidak ditemukan");
            });
    });

    const validateForm = (): boolean => {
        let isValid = true;
        clearErrors();
        if (!data.variant_id) {
            setError("variant_id", "Produk wajib dipilih");
            isValid = false;
        }
        if (!data.quantity || Number(data.quantity) < 1) {
            setError("quantity", "Jumlah wajib diisi minimal 1");
            isValid = false;
        }
        if (!data.reason) {
            setError("reason", "Alasan wajib diisi");
            isValid = false;
        }
        if (!data.rejected_at) {
            setError("rejected_at", "Tanggal wajib diisi");
            isValid = false;
        }
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        post("/admin/product-rejects", {
            onSuccess: () => reset(),
            preserveState: true,
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full lg:w-fit" variant={"yellow"}>
                    <CircleFadingPlus className="mr-2 h-4 w-4" />
                    <span>Tambah Reject</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Tambah Produk Reject</DialogTitle>
                    <DialogDescription>
                        Catat produk yang akan direject/dikembalikan.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label
                            htmlFor="variant"
                            className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1"
                        >
                            Varian Produk
                        </Label>
                        <SelectSearchInput
                            value={data.variant_id}
                            options={variantOptions.variants}
                            placeholder="Cari varian produk"
                            onFinding={(search, setOptions) =>
                                debounceVariantSearch(search, setOptions)
                            }
                            onChange={(value) =>
                                setData("variant_id", value.toString())
                            }
                        />
                        {errors.variant_id && (
                            <span className="text-red-500 text-sm">
                                <ErrorInput error={errors.variant_id} />
                            </span>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label
                            htmlFor="quantity"
                            className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1"
                        >
                            Jumlah
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={data.quantity}
                            onChange={(e) =>
                                setData("quantity", e.target.value)
                            }
                        />
                        {errors.quantity && (
                            <span className="text-red-500 text-sm">
                                <ErrorInput error={errors.quantity} />
                            </span>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label
                            htmlFor="rejected_at"
                            className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1"
                        >
                            Tanggal
                        </Label>
                        <DatePickerInput
                            value={data.rejected_at}
                            onChange={(val) =>
                                setData("rejected_at", val || "")
                            }
                            placeholder="Pilih tanggal"
                            mode="single"
                            tabIndex={0}
                        />
                        {errors.rejected_at && (
                            <span className="text-red-500 text-sm">
                                <ErrorInput error={errors.rejected_at} />
                            </span>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label
                            htmlFor="reason"
                            className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1"
                        >
                            Alasan
                        </Label>
                        <Textarea
                            id="reason"
                            value={data.reason}
                            onChange={(e) => setData("reason", e.target.value)}
                        />
                        {errors.reason && (
                            <span className="text-red-500 text-sm">
                                <ErrorInput error={errors.reason} />
                            </span>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="red" type="button">
                            <X />
                            Batalkan
                        </Button>
                    </DialogClose>
                    <Button
                        variant="yellow"
                        onClick={handleSubmit}
                        disabled={processing}
                    >
                        <Save />
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AdminProductRejectCreate;
