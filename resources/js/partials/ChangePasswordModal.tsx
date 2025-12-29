import { useForm } from "@inertiajs/react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Key, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import BlastToaster from "@/components/custom/BlastToaster";
import axios from "axios";
import { ErrorInput } from "@/components/custom/FormElement";

const ChangePasswordModal = () => {
    const [open, setOpen] = useState(false);
    const [isOldCorrect, setIsOldCorrect] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });

    const handleClick = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        setOpen(true);
    };

    const validateForm = (target: "CHECK" | "SUBMIT"): boolean => {
        let valid = true;

        if (target === "CHECK") {
            if (!data.current_password) {
                BlastToaster("error", "Password terkini wajib diisi.");
                valid = false;
            }
        } else if (target === "SUBMIT") {
            if (!data.current_password) {
                BlastToaster("error", "Password terkini wajib diisi.");
                valid = false;
            }
            if (!data.new_password) {
                BlastToaster("error", "Password baru wajib diisi.");
                valid = false;
            }
            if (!data.new_password_confirmation) {
                BlastToaster("error", "Konfirmasi password wajib diisi.");
                valid = false;
            }
            if (data.new_password !== data.new_password_confirmation) {
                BlastToaster(
                    "error",
                    "Konfirmasi password tidak sesuai dengan password baru."
                );
                valid = false;
            }
        }
        return valid;
    };

    const handleSubmit = () => {
        if (!validateForm("SUBMIT")) return;
        put("/profile/change-password", {
            onSuccess: () => {
                setOpen(false);
                reset();
                setIsOldCorrect(false);
            },
            onError: () => {
                BlastToaster("error", "Gagal mengubah password.");
            },
        });
    };

    const handleCheckCurrentPassword = async () => {
        if (!validateForm("CHECK")) return;
        try {
            setIsChecking(true);
            const response = await axios.post("/profile/check-password", {
                current_password: data.current_password,
            });

            if (response.data.valid) {
                setIsOldCorrect(true);
            } else {
                BlastToaster("error", "Password terkini tidak sesuai.");
                setIsOldCorrect(false);
            }
        } catch (error) {
            BlastToaster("error", "Password terkini tidak sesuai.");
            setIsOldCorrect(false);
        } finally {
            setIsChecking(false);
        }
    };

    const handleCloseOpen = (current: boolean) => {
        setOpen(current);
        setTimeout(() => {
            if (!current) {
                setIsOldCorrect(false);
                reset();
                setIsChecking(false);
            }
        }, 250);
    };

    return (
        <>
            <DropdownMenuItem
                key={"change-password"}
                className="flex w-full cursor-pointer items-center gap-2"
                onSelect={handleClick}
            >
                <Key />
                Ubah Password
            </DropdownMenuItem>

            <Dialog open={open} onOpenChange={handleCloseOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Password</DialogTitle>
                        <DialogDescription>
                            Jika anda mengubah password, Anda perlu login
                            kembali dengan password baru Anda
                        </DialogDescription>

                        <div className="mt-4">
                            {isOldCorrect ? (
                                <>
                                    <div className="flex flex-col w-full mb-3">
                                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                            Password Baru
                                        </label>
                                        <Input
                                            type="password"
                                            value={data.new_password}
                                            onChange={(e) =>
                                                setData(
                                                    "new_password",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        {errors.new_password && (
                                            <ErrorInput
                                                error={errors.new_password}
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                            Konfirmasi Password Baru
                                        </label>
                                        <Input
                                            type="password"
                                            value={
                                                data.new_password_confirmation
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "new_password_confirmation",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        {errors.new_password_confirmation && (
                                            <ErrorInput
                                                error={
                                                    errors.new_password_confirmation
                                                }
                                            />
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col w-full">
                                    <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                        Password Terkini
                                    </label>
                                    <Input
                                        type="password"
                                        value={data.current_password}
                                        onChange={(e) =>
                                            setData(
                                                "current_password",
                                                e.target.value
                                            )
                                        }
                                    />
                                    {errors.current_password && (
                                        <ErrorInput
                                            error={errors.current_password}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCloseOpen.bind(this, false)}
                        >
                            Batalkan
                        </Button>
                        {isOldCorrect ? (
                            <Button
                                variant="red"
                                onClick={handleSubmit}
                                disabled={processing}
                            >
                                {processing ? (
                                    <Loader className="animate-spin" />
                                ) : (
                                    <span>Ya, Ubah Password</span>
                                )}
                            </Button>
                        ) : (
                            <Button
                                variant="yellow"
                                onClick={handleCheckCurrentPassword}
                                disabled={isChecking}
                            >
                                {isChecking ? (
                                    <Loader className="animate-spin" />
                                ) : (
                                    <span>Konfirmasi Password Terkini</span>
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ChangePasswordModal;
