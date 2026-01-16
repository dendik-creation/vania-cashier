import { ErrorInput, SelectSearchInput } from "@/components/custom/FormElement";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/partials/PageTitle";
import { Setting } from "@/types/setting";
import { useForm } from "@inertiajs/react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader, Plus, Save, Trash2 } from "lucide-react";
import { FormEvent } from "react";
import { cn } from "@/lib/utils";
registerPlugin(FilePondPluginFileValidateType);
registerPlugin(FilePondPluginImagePreview);

type PageProps = PageTitleProps & {
    setting: Setting;
};

const paymentMethodOptions = [
    { label: "QRIS", value: "qris" },
    { label: "Tunai", value: "cash" },
    { label: "Transfer", value: "transfer" },
    { label: "Debit", value: "debit" },
];

const AdminSettingIndex = ({ title, description, setting }: PageProps) => {
    const { data, setData, setError, errors, clearErrors, processing, post } =
        useForm({
            _method: "PUT",
            app_name: setting.app_name || "",
            app_logo: setting.app_logo || (null as File | null),
            app_address: setting.app_address || "",
            eligible_point_minimum: setting.eligible_point_minimum || 0,
            idr_point_value: setting.idr_point_value || 0,
            minimum_point_can_used: setting.minimum_point_can_used || 0,
            admin_fee_criteria: setting.admin_fee_criteria || [],
            product_types: setting.product_types || "",
        });
    const handleChangeInput = (field: keyof typeof data, value: any) => {
        setData(field, value);
    };
    const handleInitFile = async () => {
        try {
            // If app_logo is an object with a 'name' and 'type', treat it as a File-like object
            if (
                data.app_logo &&
                typeof data.app_logo === "object" &&
                "name" in data.app_logo &&
                "type" in data.app_logo
            ) {
                return;
            }
            // If app_logo is a string (URL), fetch and convert to File
            if (
                typeof data.app_logo === "string" &&
                data.app_logo.trim() !== "" &&
                !data.app_logo.startsWith("blob:")
            ) {
                const response = await fetch(data.app_logo);
                if (!response.ok) throw new Error("Failed to fetch logo");
                const arrayBuffer = await response.arrayBuffer();
                const contentType =
                    response.headers.get("content-type") || "image/png";
                const urlParts = data.app_logo.split("/");
                const filename = urlParts[urlParts.length - 1] || "icon";
                const file = new File([arrayBuffer], filename, {
                    type: contentType,
                });
                setData("app_logo", file);
            }
        } catch (error) {
            console.error("Error fetching app logo:", error);
        }
    };
    const addCriteriaAdminFee = () => {
        const updated = [
            ...data.admin_fee_criteria,
            {
                payment_method: "",
                min_total: 0,
                admin_fee: 0,
                bank_origin: "",
            },
        ];
        setData("admin_fee_criteria", updated);
    };

    const removeCriteriaAdminFee = (index: number) => {
        const updated = data.admin_fee_criteria.filter((_, i) => i !== index);
        setData("admin_fee_criteria", updated);
    };
    const validateForm = (): boolean => {
        let isValid = true;
        clearErrors();
        if (!data.app_name || data.app_name.trim() === "") {
            setError("app_name", "Nama Aplikasi wajib diisi.");
            isValid = false;
        }
        if (!data.app_address || data.app_address.trim() === "") {
            setError("app_address", "Alamat wajib diisi.");
            isValid = false;
        }
        if (
            !data.app_logo ||
            (typeof data.app_logo === "string" && data.app_logo.trim() === "")
        ) {
            setError("app_logo", "Logo Aplikasi wajib diisi.");
            isValid = false;
        }
        if (!data.eligible_point_minimum || data.eligible_point_minimum < 0) {
            setError(
                "eligible_point_minimum",
                "Nominal minimum syarat dapat poin wajib diisi dan tidak boleh negatif."
            );
            isValid = false;
        }
        if (!data.idr_point_value || data.idr_point_value < 0) {
            setError(
                "idr_point_value",
                "Nilai tukar setiap poin wajib diisi dan tidak boleh negatif."
            );
            isValid = false;
        }
        if (!data.minimum_point_can_used || data.minimum_point_can_used < 0) {
            setError(
                "minimum_point_can_used",
                "Minimal poin yang dapat digunakan wajib diisi dan tidak boleh negatif."
            );
            isValid = false;
        }
        if (!data.product_types || data.product_types.trim() === "") {
            setError("product_types", "Tipe produk wajib diisi.");
            isValid = false;
        }
        if (data.admin_fee_criteria.length === 0) {
            setError(
                "admin_fee_criteria",
                "Minimal harus ada satu kriteria biaya admin."
            );
            isValid = false;
        } else {
            data.admin_fee_criteria.forEach((criteria, index) => {
                if (
                    !criteria.payment_method ||
                    criteria.payment_method.trim() === ""
                ) {
                    setError(
                        `admin_fee_criteria.${index}.payment_method`,
                        "Wajib diisi"
                    );
                    isValid = false;
                }
                if (criteria.payment_method === "debit") {
                    if (
                        !criteria.bank_origin ||
                        criteria.bank_origin.trim() === ""
                    ) {
                        setError(
                            `admin_fee_criteria.${index}.bank_origin`,
                            "Wajib diisi"
                        );
                        isValid = false;
                    }
                } else {
                    if (
                        criteria.min_total === null ||
                        criteria.min_total === undefined ||
                        criteria.min_total < 0
                    ) {
                        setError(
                            `admin_fee_criteria.${index}.min_total`,
                            "Wajib diisi"
                        );
                        isValid = false;
                    }
                }
                if (
                    criteria.admin_fee === null ||
                    criteria.admin_fee === undefined ||
                    criteria.admin_fee < 0
                ) {
                    setError(
                        `admin_fee_criteria.${index}.admin_fee`,
                        "Wajib diisi"
                    );
                    isValid = false;
                }
            });
        }
        return isValid;
    };
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        post("/admin/settings", {
            preserveScroll: true,
            replace: true,
        });
    };
    return (
        <AppLayout>
            <div className="mb-4">
                <PageTitle title={title} description={description} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
                <div className="flex flex-col w-full">
                    <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                        Nama Aplikasi
                    </Label>
                    <Input
                        type="text"
                        placeholder="Masukkan Nama Aplikasi"
                        className="w-full"
                        disabled={processing}
                        value={data.app_name || ""}
                        onChange={(e) =>
                            handleChangeInput("app_name", e.target.value)
                        }
                    />
                    {errors.app_name && <ErrorInput error={errors.app_name} />}
                </div>
                <div className="flex flex-col w-full lg:col-span-2">
                    <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                        Alamat (Untuk struk)
                    </Label>
                    <Textarea
                        placeholder="Masukkan Alamat"
                        className="w-full"
                        disabled={processing}
                        value={data.app_address || ""}
                        onChange={(e) =>
                            handleChangeInput("app_address", e.target.value)
                        }
                    />
                    {errors.app_address && (
                        <ErrorInput error={errors.app_address} />
                    )}
                </div>
                <div className="flex flex-col w-full lg:col-span-3">
                    <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                        Logo Aplikasi
                    </Label>
                    <FilePond
                        oninit={handleInitFile}
                        allowProcess={false}
                        allowMultiple={false}
                        allowPaste={true}
                        allowReorder={false}
                        allowImagePreview={true}
                        files={data.app_logo ? [data.app_logo] : []}
                        onupdatefiles={(fileItems) => {
                            const file = fileItems[0]?.file as File | undefined;
                            setData("app_logo", file ?? null);
                        }}
                        acceptedFileTypes={[
                            "image/jpeg",
                            "image/jpg",
                            "image/png",
                            "image/gif",
                            "image/webp",
                        ]}
                        labelIdle='<span class="filepond--label-action">Pilih Gambar</span>'
                    />
                    {errors.app_logo && <ErrorInput error={errors.app_logo} />}
                </div>
                <div className="flex flex-col w-full">
                    <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                        Nominal minimum syarat dapat poin
                    </Label>
                    <Input
                        type="number"
                        placeholder="Masukkan Nominal"
                        className="w-full"
                        disabled={processing}
                        value={data.eligible_point_minimum || ""}
                        onChange={(e) =>
                            handleChangeInput(
                                "eligible_point_minimum",
                                e.target.value
                            )
                        }
                    />
                    {errors.eligible_point_minimum && (
                        <ErrorInput error={errors.eligible_point_minimum} />
                    )}
                </div>
                <div className="flex flex-col w-full">
                    <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                        Nilai tukar setiap poin (Rupiah)
                    </Label>
                    <Input
                        type="number"
                        placeholder="Masukkan Nominal"
                        className="w-full"
                        disabled={processing}
                        value={data.idr_point_value || ""}
                        onChange={(e) =>
                            handleChangeInput("idr_point_value", e.target.value)
                        }
                    />
                    {errors.idr_point_value && (
                        <ErrorInput error={errors.idr_point_value} />
                    )}
                </div>
                <div className="flex flex-col w-full">
                    <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                        Minimal poin yang dapat digunakan
                    </Label>
                    <Input
                        type="number"
                        placeholder="Masukkan Angka"
                        className="w-full"
                        disabled={processing}
                        value={data.minimum_point_can_used || ""}
                        onChange={(e) =>
                            handleChangeInput(
                                "minimum_point_can_used",
                                e.target.value
                            )
                        }
                    />
                    {errors.minimum_point_can_used && (
                        <ErrorInput error={errors.minimum_point_can_used} />
                    )}
                </div>
                <div className="flex flex-col w-full lg:col-span-3">
                    <div className="flex justify-between items-center mb-2">
                        <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Kriteria Biaya Admin Transaksi
                        </Label>
                        <Button
                            type="button"
                            onClick={addCriteriaAdminFee}
                            variant={"blue"}
                            size="sm"
                        >
                            <Plus />
                            Tambah Kriteria
                        </Button>
                    </div>
                    {data.admin_fee_criteria.map((criteria, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "grid grid-cols-1 gap-3 mb-2",
                                criteria.payment_method === "debit"
                                    ? "lg:grid-cols-4"
                                    : "lg:grid-cols-3"
                            )}
                        >
                            <div className="flex flex-col flex-1">
                                <div className="flex text-xs gap-2">
                                    <Label className="text-xs mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                        Metode Pembayaran
                                    </Label>
                                    <ErrorInput
                                        afterLabel={true}
                                        error={
                                            errors[
                                                `admin_fee_criteria.${idx}.payment_method`
                                            ]
                                        }
                                    />
                                </div>
                                <SelectSearchInput
                                    options={paymentMethodOptions}
                                    placeholder="Pilih metode"
                                    value={criteria.payment_method}
                                    onChange={(value) => {
                                        const updated = [
                                            ...data.admin_fee_criteria,
                                        ];
                                        updated[idx] = {
                                            ...updated[idx],
                                            payment_method: value.toString(),
                                        };
                                        setData("admin_fee_criteria", updated);
                                    }}
                                />
                            </div>
                            {criteria.payment_method === "debit" && (
                                <div className="flex flex-col flex-1">
                                    <div className="flex text-xs gap-2">
                                        <Label className="text-xs mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                            Bank Asal
                                        </Label>
                                        <ErrorInput
                                            afterLabel={true}
                                            error={
                                                errors[
                                                    `admin_fee_criteria.${idx}.bank_origin`
                                                ]
                                            }
                                        />
                                    </div>
                                    <Input
                                        type="text"
                                        className="w-full"
                                        disabled={processing}
                                        placeholder="Masukkan Nama Bank"
                                        value={criteria.bank_origin || ""}
                                        onChange={(e) => {
                                            const updated = [
                                                ...data.admin_fee_criteria,
                                            ];
                                            updated[idx] = {
                                                ...updated[idx],
                                                bank_origin:
                                                    e.target.value.toUpperCase(),
                                            };
                                            setData(
                                                "admin_fee_criteria",
                                                updated
                                            );
                                        }}
                                    />
                                </div>
                            )}
                            <div className="flex flex-col flex-1">
                                <div className="flex text-xs gap-2">
                                    <Label className="text-xs mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                        Minimal Total Transaksi
                                    </Label>
                                    <ErrorInput
                                        afterLabel={true}
                                        error={
                                            errors[
                                                `admin_fee_criteria.${idx}.min_total` as any
                                            ]
                                        }
                                    />
                                </div>
                                <Input
                                    type="number"
                                    min={0}
                                    className="w-full"
                                    disabled={processing}
                                    value={criteria.min_total}
                                    onChange={(e) => {
                                        const updated = [
                                            ...data.admin_fee_criteria,
                                        ];
                                        updated[idx] = {
                                            ...updated[idx],
                                            min_total: Number(e.target.value),
                                        };
                                        setData("admin_fee_criteria", updated);
                                    }}
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <div className="flex text-xs gap-2">
                                    <Label className="text-xs mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                        Biaya admin diterapkan{" "}
                                        {criteria.payment_method === "debit" &&
                                            "(Jika beda bank)"}
                                    </Label>
                                    <ErrorInput
                                        afterLabel={true}
                                        error={
                                            errors[
                                                `admin_fee_criteria.${idx}.admin_fee` as any
                                            ]
                                        }
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min={0}
                                        className="w-full"
                                        disabled={processing}
                                        value={criteria.admin_fee}
                                        onChange={(e) => {
                                            const updated = [
                                                ...data.admin_fee_criteria,
                                            ];
                                            updated[idx] = {
                                                ...updated[idx],
                                                admin_fee: Number(
                                                    e.target.value
                                                ),
                                            };
                                            setData(
                                                "admin_fee_criteria",
                                                updated
                                            );
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant={"red"}
                                        disabled={processing}
                                        onClick={() =>
                                            removeCriteriaAdminFee(idx)
                                        }
                                    >
                                        <Trash2 />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {errors.admin_fee_criteria && (
                        <ErrorInput error={errors.admin_fee_criteria} />
                    )}
                </div>
                <div className="flex flex-col w-full lg:col-span-3">
                    <Label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                        Tipe produk yanga ada (dipisah dengan koma)
                    </Label>
                    <Input
                        type="text"
                        placeholder="Pisahkan tipe produk dengan koma"
                        className="w-full"
                        disabled={processing}
                        value={data.product_types || ""}
                        onChange={(e) =>
                            handleChangeInput("product_types", e.target.value)
                        }
                    />
                    {errors.product_types && (
                        <ErrorInput error={errors.product_types} />
                    )}
                </div>
            </div>
            <Button
                onClick={handleSubmit}
                variant={"yellow"}
                size={"lg"}
                disabled={processing}
                className="w-full"
            >
                {processing ? <Loader className="animate-spin" /> : <Save />}
                <span>Simpan Pengaturan</span>
            </Button>
        </AppLayout>
    );
};

export default AdminSettingIndex;
