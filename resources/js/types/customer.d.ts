import { PageTitleProps } from "@/Partials/PageTitle";
import { PaginationData } from "./global";

export type Customer = {
    id: number;
    name: string;
    phone: string;
    address: string;
    type: string;
    joined_at: string;
    points: number;
    transaction_count?: number;
};

export type CustomerIndexProps = PageTitleProps & {
    customers: PaginationData<Customer>;
    filters: {
        search?: string;
        type?: string;
    };
};
