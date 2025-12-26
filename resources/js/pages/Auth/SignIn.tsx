import { useForm, usePage } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ErrorInput } from "@/components/custom/FormElement";
import { Toaster } from "react-hot-toast";
import BlastToaster from "@/components/custom/BlastToaster";
import { Key, Loader, LogIn, User } from "lucide-react";
import { useEffect } from "react";

export default function SignIn({ app_name }: { app_name: string }) {
    const { flash } = usePage().props as any;
    const { data, setData, post, processing, errors, setError } = useForm({
        username: "",
        password: "",
    });

    useEffect(() => {
        document.title = `Login - ${app_name}`;
        if (flash?.success) {
            BlastToaster("success", flash?.success);
        } else if (flash?.error) {
            BlastToaster("error", flash?.error);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.username) setError("username", "Masukkan username");
        if (!data.password) setError("password", "Masukkan password");
        if (!data.username || !data.password) return;
        post("/auth/signin", {
            preserveScroll: true,
            replace: true,
            onError: (error) => {
                return BlastToaster("error", error.message);
            },
        });
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-background">
            <Toaster position={"top-center"} reverseOrder={false} />
            <Card className="w-full max-w-7xl shadow-md mx-4 flex flex-col md:flex-row">
                {/* Kiri: Gambar */}
                <div className="w-full flex flex-1 items-center justify-center dark:bg-muted rounded-t-md md:rounded-l-md md:rounded-tr-none p-6">
                    <img
                        src="/icon.png"
                        alt="Icon Image"
                        className="mx-auto bg-cover object-center"
                    />
                </div>
                {/* Kanan: Form */}
                <div className="w-full flex flex-[1.5] flex-col justify-center p-6">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-center font-bold text-2xl">
                            {app_name}
                        </CardTitle>
                        <CardDescription className="text-center">
                            Selamat datang dan masuk ke akun Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative">
                                <div className="flex items-center">
                                    <span className="absolute left-3 text-gray-500">
                                        <User />
                                    </span>
                                    <Input
                                        type="text"
                                        placeholder="Username"
                                        autoFocus={true}
                                        value={data.username}
                                        onChange={(e) =>
                                            setData("username", e.target.value)
                                        }
                                        className={`pl-10 py-6 ${
                                            errors.username
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />
                                </div>
                                {errors.username && (
                                    <ErrorInput error={errors.username} />
                                )}
                            </div>
                            <div className="relative">
                                <div className="flex items-center">
                                    <span className="absolute left-3 text-gray-500">
                                        <Key />
                                    </span>
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        className={`pl-10 py-6 ${
                                            errors.password
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />
                                </div>
                                {errors.password && (
                                    <ErrorInput error={errors.password} />
                                )}
                            </div>
                            <Button
                                type="submit"
                                className="w-full p-6"
                                variant={"yellow"}
                                disabled={processing}
                            >
                                {processing ? (
                                    <Loader className="animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <span>Masuk</span>
                                        <LogIn />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </div>
            </Card>
        </div>
    );
}
