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
    humanPaymentMethod,
    ymdToIdDate,
} from "@/components/helper/helper";
import { Banknote, ShoppingCart, Package, CreditCard } from "lucide-react";
import Chart from "react-apexcharts";
import DynamicCard from "@/components/custom/DynamicCard";

type DashboardProps = PageTitleProps & {
    summary: {
        revenue_today: number;
        transaction_count: number;
        items_sold: number;
    };
    charts: {
        hourly_trend: {
            hour: string;
            revenue: number;
            count: number;
        }[];
        payment_methods: {
            method: string;
            total_trx: number;
            total_amount: number;
        }[];
    };
    recent_transactions: {
        id: number;
        invoice_code: string;
        customer?: { name: string };
        total: number;
        payment_method: string;
        transaction_time: string;
    }[];
};

const CashierDashboard = ({
    title,
    description,
    summary,
    charts,
    recent_transactions,
}: DashboardProps) => {
    // 1. Chart Options: Hourly Trend (Area Chart)
    const hourlyTrendOptions = {
        chart: {
            type: "area" as const,
            height: 350,
            toolbar: { show: false },
        },
        colors: ["#3b82f6", "#10b981"], // Blue & Green
        dataLabels: { enabled: false },
        stroke: { curve: "smooth" as const, width: 2 },
        xaxis: {
            categories: charts.hourly_trend.map((item) => item.hour),
            tooltip: { enabled: false },
        },
        yaxis: [
            {
                title: { text: "Pendapatan" },
                labels: {
                    formatter: (value: number) =>
                        `${(value / 1000).toFixed(0)}k`,
                },
            },
            {
                opposite: true,
                title: { text: "Jml Transaksi" },
            },
        ],
        tooltip: {
            y: [
                {
                    formatter: (value: number) =>
                        floatToIdCurrency(Number(value)),
                },
                {
                    formatter: (value: number) => `${value} Trx`,
                },
            ],
        },
    };

    const hourlyTrendSeries = [
        {
            name: "Pendapatan",
            data: charts.hourly_trend.map((item) => Number(item.revenue)),
        },
        {
            name: "Transaksi",
            data: charts.hourly_trend.map((item) => Number(item.count)),
        },
    ];

    // 2. Chart Options: Payment Methods (Donut Chart)
    const paymentMethodOptions = {
        chart: {
            type: "donut" as const,
        },
        labels: charts.payment_methods.map((item) =>
            humanPaymentMethod(item.method.toLowerCase()),
        ),
        colors: ["#10b981", "#3b82f6", "#f59e0b"], // Green, Blue, Amber
        plotOptions: {
            pie: {
                donut: {
                    size: "65%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Total Trx",
                            formatter: () =>
                                `${charts.payment_methods.reduce(
                                    (sum, item) =>
                                        Number(sum) + Number(item.total_trx),
                                    0,
                                )}`,
                        },
                    },
                },
            },
        },
        tooltip: {
            y: {
                formatter: (val: number, opts?: any) => {
                    const amount =
                        charts.payment_methods[opts.seriesIndex].total_amount;
                    return `${val} Trx (${floatToIdCurrency(amount)})`;
                },
            },
        },
    };

    const paymentMethodSeries = charts.payment_methods.map((item) =>
        Number(item.total_trx),
    );

    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <DynamicCard
                    title="Pendapatan Hari Ini"
                    value={floatToIdCurrency(summary.revenue_today)}
                    icon={<Banknote className="w-32 h-32 text-green-100" />}
                    color="green"
                />
                <DynamicCard
                    title="Transaksi Diproses"
                    value={summary.transaction_count}
                    icon={<ShoppingCart className="w-32 h-32 text-blue-100" />}
                    color="blue"
                />
                <DynamicCard
                    title="Item Terjual"
                    value={summary.items_sold}
                    icon={<Package className="w-32 h-32 text-yellow-100" />}
                    color="yellow"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 mb-6">
                <Card className="">
                    <CardHeader>
                        <CardTitle>Aktivitas Penjualan (Per Jam)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Chart
                            options={hourlyTrendOptions}
                            series={hourlyTrendSeries}
                            type="area"
                            height={300}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Metode Pembayaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Chart
                            options={paymentMethodOptions}
                            series={paymentMethodSeries}
                            type="donut"
                            height={300}
                        />
                        <div className="mt-4 space-y-2">
                            {charts.payment_methods.map((pm, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between text-sm items-center border-b pb-1 last:border-0"
                                >
                                    <span className="font-medium text-gray-600">
                                        {humanPaymentMethod(
                                            pm.method.toLowerCase(),
                                        )}
                                    </span>
                                    <div className="text-right">
                                        <div className="font-bold">
                                            {floatToIdCurrency(pm.total_amount)}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {pm.total_trx} Transaksi
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>5 Transaksi Terakhir Anda</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Pelanggan</TableHead>
                                <TableHead>Metode</TableHead>
                                <TableHead className="text-right">
                                    Total
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recent_transactions.length > 0 ? (
                                recent_transactions.map((trx) => (
                                    <TableRow key={trx.id}>
                                        <TableCell className="font-medium">
                                            {trx.invoice_code}
                                        </TableCell>
                                        <TableCell>
                                            {/* Ambil jam saja karena ini dashboard harian */}
                                            {ymdToIdDate(
                                                trx.transaction_time,
                                                true,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {trx.customer
                                                ? trx.customer.name
                                                : "Umum"}
                                        </TableCell>
                                        <TableCell>
                                            <span className="">
                                                {humanPaymentMethod(
                                                    trx.payment_method.toLowerCase(),
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-green-600">
                                            {floatToIdCurrency(trx.total)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        Belum ada transaksi hari ini.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
};

export default CashierDashboard;
