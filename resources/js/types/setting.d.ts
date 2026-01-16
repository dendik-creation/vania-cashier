export type Setting = {
    app_name: string;
    app_logo: string;
    app_address: string;
    admin_fee_criteria: {
        payment_method: "qris" | "cash" | "transfer" | "debit" | string;
        min_total: number;
        bank_origin?: string;
        admin_fee: number;
    }[];
    product_types: string;
    eligible_point_minimum: number;
    idr_point_value: number;
    minimum_point_can_used: number;
};
