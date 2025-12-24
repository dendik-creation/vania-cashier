import { Setting } from "./setting";

export type Transaction = {
    id: number;
    invoice_code: string;
    cashier_id: number;
    customer_type: "general" | "member" | "reseller";
    customer_id: number | null;
    points_earned: number;
    point_used: number;
    subtotal: number;
    discount: number;
    total: number;
    payment_method: "cash" | "qris" | "transfer";
    admin_fee: number;
    transaction_time: string;
    items: TransactionItem[];
};

export type TransactionItem = {
    id: number;
    transaction_id: number;
    variant_id: number;
    price_per_item: number;
    quantity: number;
    subtotal: number;
};

export type TransactionCreateProps = {
    admin_fee_criteria: Setting["admin_fee_criteria"];
    eligible_point_minimum: Setting["eligible_point_minimum"];
    idr_point_value: Setting["idr_point_value"];
    minimum_point_can_used: Setting["minimum_point_can_used"];
};
