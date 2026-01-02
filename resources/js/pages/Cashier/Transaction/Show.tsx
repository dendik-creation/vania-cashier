import AppLayout, { useInertiaShared } from "@/partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/partials/PageTitle";
import { Transaction } from "@/types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    User,
    Calendar,
    FileText,
    MapPin,
    Phone,
    ArrowLeft,
    Edit,
} from "lucide-react";
import {
    floatToIdCurrency,
    humanPaymentMethod,
    ymdToIdDate,
} from "@/components/helper/helper";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";

type PageProps = PageTitleProps & {
    transaction: Transaction;
};

const CashierTransactionShow = ({
    title,
    description,
    transaction,
}: PageProps) => {
    const { flash } = useInertiaShared();
    return (
        <AppLayout>
            <div className="flex items-center justify-between">
                <PageTitle title={title} description={description} />
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild>
                        <Link href={"/cashier/transactions/records"}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                        </Link>
                    </Button>
                    {flash.user.id === transaction.cashier_id && (
                        <Button variant="yellow" asChild>
                            <Link
                                href={`/cashier/transactions/${transaction.id}/edit`}
                            >
                                <Edit className="w-4 h-4 mr-2" /> Edit Transaksi
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Card Customer */}
                <Card className="col-span-1 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="h-5 w-5" />
                            Informasi Pelanggan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {transaction.customer ? (
                            <>
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Nama
                                    </span>
                                    <span className="font-semibold">
                                        {transaction.customer.name}
                                    </span>
                                </div>
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Tipe
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="w-fit capitalize"
                                    >
                                        {transaction.customer.type}
                                    </Badge>
                                </div>
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        No. Telepon
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {transaction.customer.phone}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Alamat
                                    </span>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <span>
                                            {transaction.customer.address}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                                <User className="h-12 w-12 mb-2 opacity-20" />
                                <p>Pelanggan Umum</p>
                                <p className="text-xs">
                                    (Tidak ada data pelanggan)
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Card Pembayaran */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5" />
                            Detail Pembayaran
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Kode Transaksi
                                    </span>
                                    <span className="font-mono font-semibold text-lg">
                                        {transaction.invoice_code}
                                    </span>
                                </div>
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Waktu Transaksi
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {ymdToIdDate(
                                                transaction.transaction_time,
                                                true,
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Kasir
                                    </span>
                                    <span>{transaction.cashier?.name}</span>
                                </div>
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Metode Pembayaran
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span>
                                            {humanPaymentMethod(
                                                transaction.payment_method,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Subtotal
                                    </span>
                                    <span>
                                        {floatToIdCurrency(
                                            transaction.subtotal,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Poin Didapat
                                    </span>
                                    <span>
                                        +{transaction.point_earned} poin
                                    </span>
                                </div>
                                {transaction.point_used > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Poin Digunakan</span>
                                        <span>
                                            -{transaction.point_earned} poin
                                        </span>
                                    </div>
                                )}
                                {transaction.discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Diskon (Poin)</span>
                                        <span>
                                            -
                                            {floatToIdCurrency(
                                                transaction.discount,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {transaction.admin_fee > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Biaya Admin
                                        </span>
                                        <span>
                                            {floatToIdCurrency(
                                                transaction.admin_fee,
                                            )}
                                        </span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>
                                        {floatToIdCurrency(transaction.total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card Item Transaksi */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Item Transaksi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produk</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead className="text-right">
                                        Harga
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Qty
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Subtotal
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transaction.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="font-medium">
                                                {item.variant?.product?.name ||
                                                    "Produk dihapus"}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {item.variant?.attributes &&
                                                    Object.entries(
                                                        item.variant.attributes,
                                                    ).map(([key, value]) => (
                                                        <span
                                                            key={key}
                                                            className="mr-2 capitalize"
                                                        >
                                                            {key}:{" "}
                                                            {value as string}
                                                        </span>
                                                    ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {item.variant?.sku || "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {floatToIdCurrency(
                                                item.price_per_item,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.quantity}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {floatToIdCurrency(item.subtotal)}
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

export default CashierTransactionShow;
