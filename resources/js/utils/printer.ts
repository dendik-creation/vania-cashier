import { floatToIdCurrency, ymdToIdDate } from "@/components/helper/helper";
import { Setting } from "@/types/setting";
import { Transaction, TransactionItem } from "@/types/transaction";
import { ProductVariant } from "@/types/product";
import EscPosEncoder from "esc-pos-encoder";

export const PRINTERS = {
    RECEIPT: {
        name: "RPP02N",
        service: "000018f0-0000-1000-8000-00805f9b34fb",
        characteristic: "00002af1-0000-1000-8000-00805f9b34fb",
    },
    LABEL: {
        name: "CB-199 BT",
        service: "000018f0-0000-1000-8000-00805f9b34fb",
        characteristic: "00002af1-0000-1000-8000-00805f9b34fb",
    },
};

export class ReceiptPrinter {
    encoder: any;
    width: number = 32; // 58mm printer usually has 32 chars width

    constructor() {
        this.encoder = new EscPosEncoder();
    }

    generateReceipt(transaction: Transaction, app_setting: Setting) {
        const e = this.encoder.initialize();

        // Header
        e.align("left")
            .bold(true)
            .line(app_setting.app_name)
            .bold(true)
            .line(app_setting.app_address)
            .size("small")
            .line(ymdToIdDate(transaction.transaction_time, true))
            .line(`#${transaction.invoice_code}`)
            .line("-".repeat(this.width));

        // Info
        e.align("left")
            .line(`Kasir : ${transaction.cashier?.name || "-"}`)
            .line(`Pelanggan : ${transaction.customer?.name || "Umum"}`);
        if (transaction.customer_id) {
            e.line(`No HP : ${transaction.customer?.phone || "-"}`);
        }
        if (
            (transaction.point_earned > 0 || transaction.point_used > 0) &&
            transaction.customer_type != "general"
        ) {
            e.line(
                `Poin Terkini : ${Number(transaction.customer?.points || 0) + Number(transaction.point_earned) - Number(transaction.point_used)}`,
            );
        }
        e.line("-".repeat(this.width));

        // Items
        transaction.items.forEach((item: TransactionItem) => {
            const productName = item.variant?.product?.name || "Item";
            const attributes = [];
            if (item.variant?.attributes?.size)
                attributes.push("Size:" + item.variant.attributes.size);
            if (item.variant?.attributes?.color)
                attributes.push("Color:" + item.variant.attributes.color);
            const variants =
                attributes.length > 0 ? ` (${attributes.join(" ")})` : "";
            e.align("left").line(productName);
            e.line(variants).size("small");
            const qty = item.quantity;
            const normalPrice = item.variant.price_criteria.basic;
            const normalSubtotal =
                item.variant.price_criteria.basic * item.quantity;
            const realSubtotal = item.subtotal;
            const subtotalDiff = normalSubtotal - realSubtotal;

            // Normal price * qty           100.000 as right part top
            //                              (-10.000) as right part bottom
            const leftPart = `${qty} x ${floatToIdCurrency(normalPrice)}`;
            const rightPartTop = floatToIdCurrency(normalSubtotal);
            const rightPartBottom =
                subtotalDiff !== 0
                    ? `(-${floatToIdCurrency(subtotalDiff)})`
                    : "";

            // leftPart + rightPartTop
            const spacesTop =
                this.width - leftPart.length - rightPartTop.length;
            if (spacesTop > 0) {
                e.line(leftPart + " ".repeat(spacesTop) + rightPartTop);
            } else {
                e.line(leftPart)
                    .align("right")
                    .line(rightPartTop)
                    .align("left");
            }

            // rightPartBottom
            if (rightPartBottom) {
                const spacesBottom = this.width - rightPartBottom.length;
                e.align("left");

                if (spacesBottom > 0) {
                    e.line(" ".repeat(spacesBottom) + rightPartBottom);
                } else {
                    e.align("right").line(rightPartBottom).align("left");
                }
            }
        });

        e.line("-".repeat(this.width));

        // Totals
        const formatCurrency = (val: number) => floatToIdCurrency(val);

        const printRow = (label: string, val: string) => {
            const spaces = this.width - label.length - val.length;
            if (spaces > 0) {
                e.line(label + " ".repeat(spaces) + val);
            } else {
                e.line(label).align("right").line(val).align("left");
            }
        };

        printRow("Subtotal", formatCurrency(transaction.subtotal));
        if (transaction.point_discount > 0)
            printRow(
                "Konversi Poin",
                "-" + formatCurrency(transaction.point_discount),
            );
        if (transaction.event_discount > 0)
            printRow(
                "Diskon Event",
                "-" + formatCurrency(transaction.event_discount),
            );
        if (transaction.admin_fee > 0)
            printRow("Biaya Admin", formatCurrency(transaction.admin_fee));

        e.bold(true);
        printRow("TOTAL", formatCurrency(transaction.total));
        e.bold(false);

        // Footer
        e.line("-".repeat(this.width))
            .align("left")
            .line("Terima Kasih")
            .line("Telah Berbelanja")
            .cut();

        return e.encode();
    }

    async printReceipt(bytes: Uint8Array) {
        return this.printToBluetooth(bytes, PRINTERS.RECEIPT);
    }

    async printLabel(
        variants: (ProductVariant & { copies?: number })[],
        itemPerRow: number = 1,
    ) {
        const bytes = this.generateTSPLCommands(variants, itemPerRow);
        return this.printToBluetooth(bytes, PRINTERS.LABEL);
    }

    private generateTSPLCommands(
        variants: (ProductVariant & { copies?: number })[],
        itemPerRow: number,
    ): Uint8Array {
        let commands = "";

        // Constants for 203 DPI (8 dots/mm)
        const dpi = 8;
        const labelWidthMm = 40;
        const labelHeightMm = 30;
        const gapMm = 3;
        const horizontalGapMm = 5;

        // Calculate total width based on itemPerRow
        const totalWidthMm =
            labelWidthMm * itemPerRow + horizontalGapMm * (itemPerRow - 1);

        // Setup Label Size
        commands += `SIZE ${totalWidthMm} mm,${labelHeightMm} mm\r\n`;
        commands += `GAP ${gapMm} mm,0 mm\r\n`;
        commands += `DIRECTION 1\r\n`;
        commands += `CLS\r\n`;

        // Flatten variants
        const itemsToPrint: ProductVariant[] = [];
        variants.forEach((v) => {
            const copies = v.copies || 1;
            for (let i = 0; i < copies; i++) {
                itemsToPrint.push(v);
            }
        });

        // Process by rows
        for (let i = 0; i < itemsToPrint.length; i += itemPerRow) {
            const rowItems = itemsToPrint.slice(i, i + itemPerRow);

            commands += `CLS\r\n`;

            rowItems.forEach((item, index) => {
                // Calculate X offset for this column
                const xOffsetDots =
                    index * (labelWidthMm * dpi + horizontalGapMm * dpi);

                // Label dimensions in dots
                const labelWidthDots = labelWidthMm * dpi; // 320
                const paddingDots = 16; // 2mm padding

                // Center of the label (relative to xOffset)
                const labelCenterDots = xOffsetDots + labelWidthDots / 2;

                // 1. Title: item.product_name
                // Menggunakan Font "0" (Triumvirate) agar lebih bagus.
                // x_mul=12, y_mul=12. Estimasi lebar 12 dots/char.
                const titleText = item.product_name
                    ? item.product_name
                    : "Item";
                const titleWidthEst = titleText.length * 12;
                const titleX = Math.floor(labelCenterDots - titleWidthEst / 2);
                // TEXT x,y,"font",rotation,x_mul,y_mul,"content"
                commands += `TEXT ${titleX},10,"0",0,12,12,"${titleText}"\r\n`;

                // 2. Barcode
                // Code128.
                // Try narrow=2 first for better visibility.
                const sku = item.sku;
                // Width check: (10 * (len + 2) + 2) * 2.5
                const barcodeWidthWide = (10 * (sku.length + 2) + 2) * 2.5;
                let narrow = 2;
                let barcodeWidth = barcodeWidthWide;

                if (barcodeWidthWide > labelWidthDots - 2 * paddingDots) {
                    narrow = 1;
                    barcodeWidth = (10 * (sku.length + 2) + 2) * 1;
                }

                const barcodeX = Math.floor(labelCenterDots - barcodeWidth / 2);
                const finalBarcodeX = Math.max(
                    xOffsetDots + paddingDots,
                    barcodeX,
                );

                // Y=50, Height=60.
                commands += `BARCODE ${finalBarcodeX},50,"128",60,1,0,${narrow},${
                    narrow * 2
                },"${sku}"\r\n`;

                // 3. Details
                // Start Y after barcode. 50 + 60 + 20 (text) = 130.
                // Add gap -> 140.
                let currentY = 140;
                const lineHeight = 30;

                const leftX = xOffsetDots + paddingDots;
                const rightX = xOffsetDots + labelWidthDots - paddingDots;

                const formatPrice = (val: number) => {
                    return Math.floor(val / 1000) + "K";
                };

                const printRow = (
                    leftText: string,
                    rightText: string,
                    y: number,
                ) => {
                    // Left Text
                    commands += `TEXT ${leftX},${y},"0",0,9,9,"${leftText}"\r\n`;

                    // Right Text
                    // Estimate width: chars * 12 dots (safe for longer text)
                    const rightTextWidth = rightText.length * 12;
                    const rightTextX = rightX - rightTextWidth;
                    commands += `TEXT ${rightTextX},${y},"0",0,9,9,"${rightText}"\r\n`;
                };

                // Row 1: Color | (Beli 1) Harga
                const color = (item.attributes.color || "").substring(0, 12);
                const priceBasic = `(Beli 1) ${formatPrice(
                    item.price_criteria.basic,
                )}`;
                printRow(color, priceBasic, currentY);

                // Row 2: Size | (Beli 3) Harga
                currentY += lineHeight;
                const size = String(item.attributes.size || "").substring(
                    0,
                    12,
                );
                const price3 = `(Beli 3) ${formatPrice(
                    item.price_criteria.order_qty_3,
                )}`;
                printRow(size, price3, currentY);

                // Row 3: (empty left) | (Beli 6) Harga
                currentY += lineHeight;
                const price6 = `(Beli 6) ${formatPrice(
                    item.price_criteria.order_qty_6,
                )}`;
                printRow("", price6, currentY);
            });

            commands += `PRINT 1\r\n`;
        }

        return new TextEncoder().encode(commands);
    }

    private async printToBluetooth(
        bytes: Uint8Array,
        printerConfig: typeof PRINTERS.RECEIPT,
    ) {
        const nav = navigator as any;
        if (!nav.bluetooth) {
            throw new Error("Web Bluetooth tidak didukung di browser ini.");
        }

        try {
            console.log("Mencari perangkat...");

            const device = await nav.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: [printerConfig.service],
            });

            console.log(
                `Perangkat dipilih: ${device.name}. Menghubungkan GATT...`,
            );

            const server = await device.gatt.connect();
            console.log("GATT Terhubung.");

            const service = await server.getPrimaryService(
                printerConfig.service,
            );
            const characteristic = await service.getCharacteristic(
                printerConfig.characteristic,
            );

            console.log("Characteristic ditemukan. Memulai transfer data...");
            const CHUNK_SIZE = 50;

            const delay = (ms: number) =>
                new Promise((resolve) => setTimeout(resolve, ms));

            for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
                const chunk = bytes.slice(i, i + CHUNK_SIZE);

                await characteristic.writeValue(chunk);
                await delay(60);
            }

            console.log("Semua data terkirim.");

            await delay(1000);

            if (device.gatt.connected) {
                device.gatt.disconnect();
                console.log("Koneksi ditutup.");
            }

            return true;
        } catch (error) {
            console.error("Bluetooth Error:", error);
            throw error;
        }
    }
}
