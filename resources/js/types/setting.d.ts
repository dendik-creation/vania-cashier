export type Setting = {
    app_name: string;
    app_logo?: string;
    app_address?: string;
    admin_fee_criteria: {
        payment_method: "qris" | "cash" | "transfer";
        min_total: number;
        admin_fee: number;
    }[];
    eligible_point_minimum: number;
};
