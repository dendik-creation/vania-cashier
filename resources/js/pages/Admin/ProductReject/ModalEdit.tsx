import React from "react";
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
import { Pencil, Save, X } from "lucide-react";
import { ProductReject } from "@/types/product_reject";
import {
    DatePickerInput,
    ErrorInput,
    SelectSearchInput,
} from "@/components/custom/FormElement";

const AdminProductRejectEdit = ({ reject }: { reject: ProductReject }) => {
    const {
        data,
        setData,
        put,
        processing,
        errors,
        reset,
        clearErrors,
        setError,
    } = useForm({
        reason: reject.reason,
        rejected_at: reject.rejected_at ? reject.rejected_at.split("T")[0] : "",
        status: reject.status,
    });

    const validateForm = (): boolean => {
        let isValid = true;
        clearErrors();
        if (!data.reason) {
            setError("reason", "Alasan wajib diisi");
            isValid = false;
        }
        if (!data.status) {
            setError("status", "Status wajib dipilih");
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
        put(`/admin/product-rejects/${reject.id}`, {
            onSuccess: () => reset(),
            preserveState: true,
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"outline"} size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Produk Reject</DialogTitle>
                    <DialogDescription>
                        Perbarui informasi reject.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Produk
                        </Label>
                        <Input
                            value={
                                reject.variant?.product?.name +
                                " - " +
                                reject.variant?.sku
                            }
                            disabled
                            className="bg-gray-100"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Jumlah</Label>
                        <Input
                            value={reject.quantity}
                            disabled
                            className="bg-gray-100"
                        />
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
                        {errors.rejected_at && (
                            <span className="text-red-500 text-sm">
                                {errors.rejected_at}
                            </span>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label
                            htmlFor="status"
                            className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1"
                        >
                            Status
                        </Label>
                        <SelectSearchInput
                            options={[
                                { label: "Pending", value: "pending" },
                                { label: "Selesai", value: "done" },
                            ]}
                            value={data.status}
                            onChange={(value) =>
                                setData("status", value.toString())
                            }
                            placeholder="Pilih Status"
                            removeValue={() => setData("status", "")}
                        />
                        {errors.status && (
                            <span className="text-red-500 text-sm">
                                <ErrorInput error={errors.status} />
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

export default AdminProductRejectEdit;
