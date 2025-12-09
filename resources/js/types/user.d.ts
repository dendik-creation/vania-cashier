import { PageTitleProps } from "@/Partials/PageTitle";
import { PaginationData } from "./global";

export type User = {
    id: number;
    username: string;
    name: string;
    role: "admin" | "cashier";
    joined_at: string;
};

export type AdminUserIndexProps = PageTitleProps & {
    users: PaginationData<User>;
    filters: {
        search?: string;
        role?: "admin" | "cashier";
    };
};
