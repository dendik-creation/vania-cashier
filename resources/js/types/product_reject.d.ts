import { ProductVariant } from "./product";

export type ProductReject = {
    id: number;
    variant_id: number;
    quantity: number;
    reason: string;
    rejected_at: string;
    status: string;
    variant: ProductVariant;
};
