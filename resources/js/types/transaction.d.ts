import { Customer } from "./customer";
import { ProductVariant } from "./product";
import { Setting } from "./setting";
import { User } from "./user";

export type Transaction = {
    id: number;
    invoice_code: string;
    cashier_id: number;
    customer_type: "general" | "member" | "reseller";
    customer_id: number | null;
    point_earned: number;
    point_used: number;
    subtotal: number;
    point_discount: number;
    event_discount: number;
    total: number;
    sku_sold?: number;
    payment_method: "cash" | "qris" | "transfer" | "debit" | string;
    payment_provider?: string;
    admin_fee: number;
    transaction_time: string;
    items: TransactionItem[];
    customer?: Customer;
    cashier: User;
};

export type TransactionItem = {
    id: number;
    transaction_id: number;
    variant_id: number;
    price_per_item: number;
    quantity: number;
    subtotal: number;
    variant: ProductVariant;
};

export type TransactionCreateProps = {
    admin_fee_criteria: Setting["admin_fee_criteria"];
    eligible_point_minimum: Setting["eligible_point_minimum"];
    idr_point_value: Setting["idr_point_value"];
    minimum_point_can_used: Setting["minimum_point_can_used"];
};
