import {
    PaginatorBuilder,
    SearchInput,
    SelectSearchInput,
} from "@/components/custom/FormElement";
import {
    humanRole,
    inputDebounce,
    ymdToIdDate,
} from "@/components/helper/helper";
import { Button } from "@/components/ui/button";
import AppLayout from "@/partials/AppLayout";
import { PageTitle } from "@/Partials/PageTitle";
import { AdminUserIndexProps } from "@/types/user";
import { router, useForm } from "@inertiajs/react";
import {
    Calendar,
    MoreHorizontal,
    SearchXIcon,
    Trash2,
    User,
} from "lucide-react";
import { useEffect, useRef } from "react";
import AdminUserCreate from "./ModalCreate";
import AdminUserEdit from "./ModalEdit";
import AdminUserModalResetPassword from "./ModalResetPassword";
import ConfirmDialog from "@/components/custom/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import EmptyCard from "@/components/custom/EmptyCard";

const AdminUserIndex = ({
    title,
    description,
    users,
    filters,
}: AdminUserIndexProps) => {
    const firstRender = useRef(true);
    const { data: filterData, setData: setFilterData } = useForm({
        search: filters.search || "",
        role: filters.role || "",
    });

    const handleFilter = (key: keyof typeof filterData, value: string) => {
        setFilterData(key, value);
    };

    const debounceSearch = inputDebounce((data: typeof filterData) => {
        router.get(
            "/admin/users",
            {
                search: data.search,
                role: data.role,
            },
            {
                preserveState: true,
                replace: true,
                only: ["users"],
            },
        );
    });

    const handleDelete = (id: number) => {
        router.delete(`/admin/users/${id}`, {
            preserveScroll: true,
            replace: true,
            only: ["users"],
        });
    };

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        debounceSearch(filterData);
    }, [filterData]);
    return (
        <AppLayout>
            <PageTitle title={title} description={description} />
            <div className="flex flex-col lg:flex-row lg:justify-between items-center gap-3 mb-4">
                <div className="flex flex-col lg:flex-row items-center gap-3 w-full">
                    <SearchInput
                        placeholder={`Cari username atau nama`}
                        className="lg:max-w-sm w-full"
                        onChange={(e) => handleFilter("search", e.target.value)}
                        value={filterData.search || ""}
                    />
                    <div className="w-full lg:w-fit">
                        <SelectSearchInput
                            className="w-full"
                            placeholder="Pilih Role"
                            value={filterData.role || ""}
                            options={[
                                {
                                    label: "Kasir",
                                    value: "cashier",
                                },
                                {
                                    label: "Administrator",
                                    value: "admin",
                                },
                            ]}
                            onChange={(value) =>
                                handleFilter("role", value.toString())
                            }
                            removeValue={() => handleFilter("role", "")}
                        />
                    </div>
                </div>
                <AdminUserCreate />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {users.data.map((item, index) => (
                    <Card
                        key={item.id}
                        className="relative py-3 overflow-hidden"
                    >
                        <CardContent className="px-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-semibold text-gray-900">
                                                {item.name}
                                            </span>
                                            <span className="text-xs">
                                                {item.username}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Badge variant={"outline"}>
                                            {humanRole(item.role)}
                                        </Badge>
                                        <div className="flex items-center gap-2">
                                            <Calendar />
                                            <span className="text-xs">
                                                {ymdToIdDate(item.joined_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end mt-4">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <span>
                                            <Button variant="outline" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </span>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 p-2">
                                        <div className="space-y-2">
                                            <AdminUserEdit user={item} />
                                            <AdminUserModalResetPassword
                                                id={item.id}
                                            />
                                            <ConfirmDialog
                                                triggerNode={
                                                    <Button
                                                        variant="red"
                                                        size="sm"
                                                        className="w-full"
                                                    >
                                                        <Trash2 />
                                                        <span>Hapus</span>
                                                    </Button>
                                                }
                                                title="Hapus User"
                                                description="Menghapus user menyebabkan kehilangan akses terhadap sistem. Apakah anda yakin ?"
                                                type="danger"
                                                confirmAction={() =>
                                                    handleDelete(item.id)
                                                }
                                            />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {users.data.length === 0 && <EmptyCard />}
            </div>
            {users.total > users.per_page && (
                <PaginatorBuilder
                    prevUrl={users.prev_page_url ?? "#"}
                    nextUrl={users.next_page_url ?? "#"}
                    currentPage={users.current_page}
                    totalPage={users.last_page}
                />
            )}
        </AppLayout>
    );
};

export default AdminUserIndex;
