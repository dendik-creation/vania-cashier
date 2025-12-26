import {
    Grid2X2,
    LucideProps,
    Package,
    PackageX,
    ScanBarcode,
    ShoppingBag,
    Users,
    Users2,
} from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export type NavItems = {
    type: "item" | "splitter";
    title: string;
    url: string;
    icon?: ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
}[];

const adminNavs: NavItems = [
    {
        type: "item",
        title: "Dashboard",
        url: "/dashboard",
        icon: Grid2X2,
    },
    {
        type: "item",
        title: "Transaksi Baru",
        url: "/transactions/create",
        icon: ScanBarcode,
    },
    {
        type: "splitter",
        title: "Data Master",
        url: "#",
    },
    {
        type: "item",
        title: "Data User",
        url: "/users",
        icon: Users2,
    },
    {
        type: "item",
        title: "Data Pelanggan",
        url: "/customers",
        icon: Users,
    },
    {
        type: "item",
        title: "Data Produk",
        url: "/products",
        icon: Package,
    },
    {
        type: "splitter",
        title: "Aktivitas Sistem",
        url: "#",
    },
    {
        type: "item",
        title: "Produk Reject",
        url: "/product-rejects",
        icon: PackageX,
    },
    {
        type: "item",
        title: "Data Transaksi",
        url: "/transactions/records",
        icon: ShoppingBag,
    },
];

const cashierNavs: NavItems = [
    {
        type: "item",
        title: "Dashboard",
        url: "/dashboard",
        icon: Grid2X2,
    },
];

const addPrefixByRole = (role: string, menus: NavItems) => {
    return menus.map((menu) => {
        if (menu.type === "item") {
            return {
                ...menu,
                url: `/${role}${menu.url}`,
            };
        }
        return menu;
    });
};

export const sidebarNavs = {
    adminNavs: addPrefixByRole("admin", adminNavs),
    cashierNavs: addPrefixByRole("cashier", cashierNavs),
};
