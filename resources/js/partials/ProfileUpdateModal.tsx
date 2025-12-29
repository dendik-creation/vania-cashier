import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BlastToaster from "@/components/custom/BlastToaster";
import { ErrorInput } from "@/components/custom/FormElement";
import { User as UserIcon } from "lucide-react";
import { useInertiaShared } from "@/partials/AppLayout";
import { ymdToIdDate } from "@/components/helper/helper";

interface AuthUser {
    id?: number;
    username?: string;
    name?: string;
    role?: string;
    joined_at?: string;
}

const ProfileUpdateModal = () => {
    const [open, setOpen] = useState(false);
    const { flash } = useInertiaShared();
    const authUser: AuthUser = (flash as any)?.user || {};

    const { data, setData, put, processing, errors, reset } = useForm({
        username: authUser.username || "",
        name: authUser.name || "",
        role: authUser.role || "",
    });

    // Sync form defaults when modal opens (in case user updated elsewhere)
    useEffect(() => {
        if (open && authUser) {
            setData("username", authUser.username || "");
            setData("name", authUser.name || "");
            setData("role", authUser.role || "");
        }
    }, [open]);

    const handleClick = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        setOpen(true);
    };

    const validateForm = (): boolean => {
        let valid = true;
        if (!data.username) {
            BlastToaster("error", "Username wajib diisi.");
            valid = false;
        }
        if (!data.name) {
            BlastToaster("error", "Nama wajib diisi.");
            valid = false;
        }
        return valid;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        put("/profile/update", {
            preserveScroll: true,
            onSuccess: () => {
                BlastToaster("success", "Profil berhasil diperbarui.");
                setOpen(false);
            },
            onError: () => {
                BlastToaster("error", "Gagal memperbarui profil.");
            },
            only: ["flash"],
        });
    };

    const handleCloseOpen = (current: boolean) => {
        setOpen(current);
        if (!current) {
            setTimeout(() => {
                reset();
            }, 250);
        }
    };

    return (
        <>
            <DropdownMenuItem
                key={"profile-update"}
                className="flex w-full cursor-pointer items-center gap-2"
                onSelect={handleClick}
            >
                <UserIcon />
                Ubah Profil
            </DropdownMenuItem>

            <Dialog open={open} onOpenChange={handleCloseOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Profil</DialogTitle>
                        <DialogDescription>
                            Perbarui informasi akun Anda di bawah ini.
                        </DialogDescription>
                        <div className="mt-4 space-y-4">
                            <div className="flex flex-col w-full">
                                <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                    Username
                                </label>
                                <Input
                                    type="text"
                                    value={data.username}
                                    onChange={(e) =>
                                        setData("username", e.target.value)
                                    }
                                />
                                {errors.username && (
                                    <ErrorInput error={errors.username} />
                                )}
                            </div>
                            <div className="flex flex-col w-full">
                                <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                    Nama
                                </label>
                                <Input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                />
                                {errors.name && (
                                    <ErrorInput error={errors.name} />
                                )}
                            </div>
                            <div className="flex flex-col w-full">
                                <label className="text-base mb-1">Role</label>
                                <Input
                                    type="text"
                                    value={data.role}
                                    disabled
                                    readOnly
                                />
                            </div>
                            <div className="flex flex-col w-full">
                                <label className="text-base mb-1">
                                    Bergabung Pada
                                </label>
                                <Input
                                    type="text"
                                    value={
                                        ymdToIdDate(authUser.joined_at) || ""
                                    }
                                    disabled
                                    readOnly
                                />
                            </div>
                        </div>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCloseOpen.bind(this, false)}
                        >
                            Batalkan
                        </Button>
                        <Button
                            variant="yellow"
                            onClick={handleSubmit}
                            disabled={processing}
                        >
                            {processing ? (
                                <span>Memproses...</span>
                            ) : (
                                <span>Simpan Perubahan</span>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ProfileUpdateModal;
