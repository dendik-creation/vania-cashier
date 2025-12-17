import { PageTitleProps } from "@/Partials/PageTitle";
import { PaginationData } from "./global";

// Product type based on migration
export type Product = {
    id: number;
    name: string;
    type: "shoes" | "bag" | "accessory";
    brand?: string | null;
    created_at?: string;
    updated_at?: string;
    variants_count?: number;
    variants?: ProductVariant[];
};

// ProductVariant with JSON fields
export type ProductVariant = {
    id: number;
    product_id: number;
    sku: string;
    attributes: {
        size?: string | number;
        color?: string;
        [key: string]: any;
    };
    price_criteria: PriceCriteria; // Multiple price criteria as JSON
    stock: number;
    created_at?: string;
    updated_at?: string;
    product?: Product;
};

// Price criteria structure for future use
export type PriceCriteria = {
    basic: number;
    reseller: number;
    order_qty_3: number;
    order_qty_6: number;
};

// Form variant for Create/Edit
export type VariantFormData = {
    id?: number;
    sku: string;
    attributes: {
        size?: string;
        color?: string;
    };
    price_criteria: {
        basic: number | string;
        reseller: number | string;
        order_qty_3: number | string;
        order_qty_6: number | string;
    };
    stock: number | string;
};

export type AdminProductIndexProps = PageTitleProps & {
    products: PaginationData<Product>;
    filters: {
        search?: string;
        type?: string;
    };
};

export type AdminProductCreateProps = PageTitleProps;

export type AdminProductEditProps = PageTitleProps & {
    product: Product;
};

export type AdminProductShowProps = PageTitleProps & {
    product: Product;
};
