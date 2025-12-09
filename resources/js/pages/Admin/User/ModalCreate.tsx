import { ErrorInput, SelectSearchInput } from "@/components/custom/FormElement";
import { generateStringRand } from "@/components/helper/helper";
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
import { useForm } from "@inertiajs/react";
import { CircleFadingPlus, CircleX, Dices, Loader, Save } from "lucide-react";
import React from "react";

const AdminUserCreate = () => {
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
        username: "",
        name: "",
        role: "",
        password: "",
    });

    const handleChangeInput = (key: keyof typeof data, value: string) => {
        setData(key, value);
    };

    const handleRandomPassword = () => {
        const characters = generateStringRand(8, true, false, true);
        setData("password", characters);
    };

    const validateForm = (): boolean => {
        let isValid = true;
        clearErrors();
        if (!data.username || data.username.trim() === "") {
            setError("username", "Username wajib diisi");
            isValid = false;
        }
        if (!data.name || data.name.trim() === "") {
            setError("name", "Nama Lengkap wajib diisi");
            isValid = false;
        }
        if (!data.role || data.role.trim() === "") {
            setError("role", "Role wajib dipilih");
            isValid = false;
        }
        if (!data.password || data.password.trim() === "") {
            setError("password", "Password wajib diisi");
            isValid = false;
        }
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        post("/admin/users", {
            replace: true,
            preserveState: true,
            only: ["users"],
            onSuccess: () => reset(),
        });
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full lg:w-fit" variant={"yellow"}>
                    <CircleFadingPlus />
                    <span>Tambah User</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-7xl">
                <DialogHeader>
                    <DialogTitle>Tambah User</DialogTitle>
                    <DialogDescription className="mb-3">
                        Silakan isi data user (kasir atau admin) baru
                    </DialogDescription>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div className="flex flex-col w-full">
                            <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                Username
                            </label>
                            <Input
                                type="text"
                                placeholder="Masukkan Username"
                                className="w-full"
                                disabled={processing}
                                value={data.username || ""}
                                onChange={(e) =>
                                    handleChangeInput(
                                        "username",
                                        e.target.value,
                                    )
                                }
                            />
                            {errors.username && (
                                <ErrorInput error={errors.username} />
                            )}
                        </div>
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
                                Role
                            </label>
                            <div className="">
                                <SelectSearchInput
                                    placeholder="Pilih Role"
                                    options={[
                                        {
                                            label: "Administrator",
                                            value: "admin",
                                        },
                                        {
                                            label: "Kasir",
                                            value: "cashier",
                                        },
                                    ]}
                                    value={data.role || ""}
                                    onChange={(value) =>
                                        handleChangeInput(
                                            "role",
                                            value.toString(),
                                        )
                                    }
                                    removeValue={() =>
                                        handleChangeInput("role", "")
                                    }
                                />
                            </div>
                            {errors.role && <ErrorInput error={errors.role} />}
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Masukkan Password"
                                    className="w-full"
                                    disabled={processing}
                                    value={data.password || ""}
                                    onChange={(e) =>
                                        handleChangeInput(
                                            "password",
                                            e.target.value,
                                        )
                                    }
                                />
                                <Button
                                    type="button"
                                    onClick={handleRandomPassword}
                                    className="absolute top-0 right-0"
                                    variant={"yellow"}
                                    size={"icon"}
                                >
                                    <Dices />
                                </Button>
                            </div>
                            {errors.password && (
                                <ErrorInput error={errors.password} />
                            )}
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

export default AdminUserCreate;
