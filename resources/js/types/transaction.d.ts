import { Setting } from "./setting";

export type Product = {
    id: number;
    name: string;
    type: "shoes" | "bag" | "accessory";
    brand?: string;
};

export type ProductVariant = {
    id: number;
    product_id: number;
    sku: string;
    attributes: {
        color?: string;
        size?: string;
    };
    price_criteria: {
        basic: number;
        reseller: number;
        min_3_qty: number;
        min_6_qty: number;
    };
    stock: number;
};

export type TransactionCreateProps = {
    admin_fee_criteria: Setting["admin_fee_criteria"];
    eligible_point_minimum: Setting["eligible_point_minimum"];
    idr_point_value: Setting["idr_point_value"];
    minimum_point_can_used: Setting["minimum_point_can_used"];
};
