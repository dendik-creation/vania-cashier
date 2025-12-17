import { generateStringRand } from "@/components/helper/helper";
import { useForm } from "@inertiajs/react";
import React from "react";
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
import { CircleX, Dices, Key, Loader, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ErrorInput } from "@/components/custom/FormElement";

// id is user.id
const AdminUserModalResetPassword = ({ id }: { id: number }) => {
    const {
        data,
        setData,
        put,
        processing,
        errors,
        reset,
        setError,
        clearErrors,
    } = useForm({
        password: "",
    });
    const handleChangeInput = (key: keyof typeof data, value: string) => {
        setData(key, value);
    };
    const validateForm = (): boolean => {
        clearErrors();
        let isValid = true;

        if (!data.password || data.password.trim() === "") {
            setError("password", "Password wajib diisi.");
            isValid = false;
        }

        return isValid;
    };

    const handleRandPassword = () => {
        const characters = generateStringRand(8);
        setData("password", characters);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        put(`/admin/users/${id}/reset-password`, {
            preserveState: true,
            replace: true,
            only: ["users"],
            onSuccess: () => reset(),
        });
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"outline"}>
                    <Key className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-7xl">
                <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription className="mb-3">
                        Silakan isi form untuk mereset password
                    </DialogDescription>
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex flex-col w-full">
                            <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                Password Baru
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
                                            e.target.value
                                        )
                                    }
                                />
                                <Button
                                    type="button"
                                    onClick={handleRandPassword}
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
                        variant="green"
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

export default AdminUserModalResetPassword;
