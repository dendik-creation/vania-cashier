import { ErrorInput, SelectSearchInput } from "@/components/custom/FormElement";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@inertiajs/react";
import { CircleFadingPlus, CircleX, Dices, Loader, Save } from "lucide-react";
import React from "react";

const AdminCustomerCreate = () => {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        clearErrors,
        setError,
        reset,
    } = useForm({
        name: "",
        phone: "",
        type: "",
        address: "",
    });

    const handleChangeInput = (key: keyof typeof data, value: string) => {
        setData(key, value);
    };

    const validateForm = (): boolean => {
        let isValid = true;
        clearErrors();
        if (!data.name || data.name.trim() === "") {
            setError("name", "Nama Lengkap wajib diisi");
            isValid = false;
        }
        if (!data.phone || data.phone.trim() === "") {
            setError("phone", "No HP wajib diisi");
            isValid = false;
        }
        if (!data.type || data.type.trim() === "") {
            setError("type", "Tipe pelanggan wajib dipilih");
            isValid = false;
        }
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        post("/admin/customers", {
            replace: true,
            preserveState: true,
            only: ["customers"],
            onSuccess: () => reset(),
        });
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full lg:w-fit" variant={"yellow"}>
                    <CircleFadingPlus />
                    <span>Tambah Pelanggan</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-7xl">
                <DialogHeader>
                    <DialogTitle>Tambah Pelanggan</DialogTitle>
                    <DialogDescription className="mb-3">
                        Silakan isi data pelanggan baru
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
                                disabled={processing}
                                value={data.name || ""}
                                onChange={(e) =>
                                    handleChangeInput("name", e.target.value)
                                }
                            />
                            {errors.name && <ErrorInput error={errors.name} />}
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                No HP
                            </label>
                            <Input
                                type="tel"
                                placeholder="Masukkan No HP"
                                className="w-full"
                                disabled={processing}
                                value={data.phone || ""}
                                onChange={(e) =>
                                    handleChangeInput("phone", e.target.value)
                                }
                            />
                            {errors.phone && (
                                <ErrorInput error={errors.phone} />
                            )}
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                Tipe Pelanggan
                            </label>
                            <div className="">
                                <SelectSearchInput
                                    placeholder="Pilih Tipe"
                                    options={[
                                        {
                                            label: "Member",
                                            value: "member",
                                        },
                                        {
                                            label: "Reseller",
                                            value: "reseller",
                                        },
                                    ]}
                                    value={data.type || ""}
                                    onChange={(value) =>
                                        handleChangeInput(
                                            "type",
                                            value.toString(),
                                        )
                                    }
                                    removeValue={() =>
                                        handleChangeInput("type", "")
                                    }
                                />
                            </div>
                            {errors.type && <ErrorInput error={errors.type} />}
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="text-base mb-1">Alamat</label>
                            <Textarea
                                placeholder="Masukkan Alamat"
                                disabled={processing}
                                value={data.address || ""}
                                onChange={(e) =>
                                    handleChangeInput("address", e.target.value)
                                }
                            />
                        </div>
                    </div>
                </DialogHeader>
                <DialogFooter className="mt-9">
                    <DialogClose asChild disabled={processing}>
                        <Button
                            variant="red"
                            disabled={processing}
                            className="flex items-center gap-2"
                        >
                            <CircleX /> Batalkan
                        </Button>
                    </DialogClose>
                    <Button
                        variant="yellow"
                        disabled={processing}
                        onClick={handleSubmit}
                        className="flex items-center gap-2"
                    >
                        {processing ? (
                            <Loader />
                        ) : (
                            <span className="flex items-center gap-2">
                                <Save /> Simpan
                            </span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AdminCustomerCreate;
