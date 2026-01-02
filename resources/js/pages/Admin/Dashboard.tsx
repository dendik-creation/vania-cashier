import AppLayout from "@/partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/partials/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    floatToIdCurrency,
    humanProductType,
    ymdToIdDate,
} from "@/components/helper/helper";
import { Banknote, ShoppingCart, Package, Users } from "lucide-react";
import Chart from "react-apexcharts";
import DynamicCard from "@/components/custom/DynamicCard";

type DashboardProps = PageTitleProps & {
    summary: {
        revenue: number;
        transactions: number;
        items_sold: number;
        customers: number;
    };
    charts: {
        sales_trend: {
            date: string;
            revenue: number;
            count: number;
        }[];
        sales_by_type: {
            type: string;
            total: number;
        }[];
    };
    top_products: {
        name: string;
        total_qty: number;
        total_revenue: number;
    }[];
    recent_transactions: {
        id: number;
        invoice_code: string;
        customer?: { name: string };
        total: number;
        transaction_time: string;
        payment_method: string;
    }[];
};

const AdminDashboard = ({
    title,
    description,
    summary,
    charts,
    top_products,
    recent_transactions,
}: DashboardProps) => {
    // Sales Trend Chart
    const salesTrendOptions = {
        chart: {
            type: "area" as const,
            height: 350,
            toolbar: { show: false },
        },
        colors: ["#10b981", "#3b82f6"],
        dataLabels: { enabled: false },
        stroke: { curve: "smooth" as const, width: 2 },
        xaxis: {
            categories: charts.sales_trend.map((item) => item.date),
        },
        yaxis: [
            {
                title: { text: "Pendapatan" },
                labels: {
                    formatter: (value: number) =>
                        `${(Number(value) / 1000).toFixed(0)}k`,
                },
            },
            {
                opposite: true,
                title: { text: "Transaksi" },
            },
        ],
        tooltip: {
            y: [
                {
                    formatter: (value: number) =>
                        floatToIdCurrency(Number(value)),
                },
                {
                    formatter: (value: number) => `${Number(value)} Trx`,
                },
            ],
        },
    };

    const salesTrendSeries = [
        {
            name: "Pendapatan",
            data: charts.sales_trend.map((item) => Number(item.revenue)),
        },
        {
            name: "Transaksi",
            data: charts.sales_trend.map((item) => Number(item.count)),
        },
    ];

    // Sales by Type Chart
    const salesByTypeOptions = {
        chart: {
            type: "donut" as const,
        },
        labels: charts.sales_by_type.map((item) => humanProductType(item.type)),
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
        plotOptions: {
            pie: {
                donut: {
                    size: "70%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Total",
                            formatter: () =>
                                floatToIdCurrency(
                                    charts.sales_by_type.reduce(
                                        (sum, item) =>
                                            Number(sum) + Number(item.total),
                                        0,
                                    ),
                                ),
                        },
                    },
                },
            },
        },
        tooltip: {
            y: {
                formatter: (value: number) => floatToIdCurrency(Number(value)),
            },
        },
    };

    const salesByTypeSeries = charts.sales_by_type.map((item) =>
        Number(item.total),
    );

    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <DynamicCard
                    title="Pendapatan Bulan Ini"
                    value={floatToIdCurrency(summary.revenue)}
                    icon={<Banknote className="w-32 h-32 text-green-100" />}
                    color="green"
                />
                <DynamicCard
                    title="Transaksi Bulan Ini"
                    value={summary.transactions}
                    icon={<ShoppingCart className="w-32 h-32 text-blue-100" />}
                    color="blue"
                />
                <DynamicCard
                    title="Item Terjual"
                    value={summary.items_sold}
                    icon={<Package className="w-32 h-32 text-yellow-100" />}
                    color="yellow"
                />
                <DynamicCard
                    title="Total Pelanggan"
                    value={summary.customers}
                    icon={<Users className="w-32 h-32 text-purple-100" />}
                    color="purple"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 mb-6">
                <Card className="">
                    <CardHeader>
                        <CardTitle>Tren Penjualan (7 Hari Terakhir)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Chart
                            options={salesTrendOptions}
                            series={salesTrendSeries}
                            type="area"
                            height={350}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Penjualan per tipe produk</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Chart
                            options={salesByTypeOptions}
                            series={salesByTypeSeries}
                            type="donut"
                            height={350}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Produk Terlaris Bulan Ini</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produk</TableHead>
                                    <TableHead className="text-right">
                                        Terjual
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Pendapatan
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {top_products.map((product, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">
                                            {product.name}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {product.total_qty}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {floatToIdCurrency(
                                                product.total_revenue,
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Transaksi Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Pelanggan</TableHead>
                                    <TableHead className="text-right">
                                        Total
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recent_transactions.map((trx) => (
                                    <TableRow key={trx.id}>
                                        <TableCell>
                                            <div className="font-medium">
                                                {trx.invoice_code}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {ymdToIdDate(
                                                    trx.transaction_time,
                                                    true,
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {trx.customer
                                                ? trx.customer.name
                                                : "Umum"}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {floatToIdCurrency(trx.total)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default AdminDashboard;
