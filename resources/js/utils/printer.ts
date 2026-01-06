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
    width: number = 32;

    constructor() {
        this.encoder = new EscPosEncoder();
    }

    private delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private withTimeout<T>(
        promise: Promise<T>,
        ms: number,
        errorMsg: string,
    ): Promise<T> {
        return Promise.race([
            promise,
            new Promise<T>((_, reject) =>
                setTimeout(() => reject(new Error(errorMsg)), ms),
            ),
        ]);
    }

    private async printToBluetooth(
        bytes: Uint8Array,
        printerConfig: typeof PRINTERS.RECEIPT,
    ) {
        const nav = navigator as any;
        if (!nav.bluetooth) {
            throw new Error(
                "Web Bluetooth tidak didukung di browser ini. Gunakan Chrome di Android.",
            );
        }

        let device: any = null;
        let server: any = null;

        try {
            console.log("Mulai memindai perangkat...");

            device = await nav.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: [printerConfig.service],
            });

            if (!device) {
                throw new Error("Tidak ada perangkat yang dipilih.");
            }

            console.log(
                `Perangkat dipilih: ${device.name}. Menghubungkan GATT...`,
            );

            let connected = false;
            let attempts = 0;
            const MAX_ATTEMPTS = 3;

            while (!connected && attempts < MAX_ATTEMPTS) {
                try {
                    attempts++;
                    console.log(`Percobaan koneksi ke-${attempts}...`);

                    server = await this.withTimeout(
                        device.gatt.connect(),
                        6000,
                        "Timeout saat mencoba menghubungkan ke Printer.",
                    );
                    connected = true;
                } catch (err) {
                    console.warn(`Gagal connect percobaan ${attempts}:`, err);
                    if (attempts >= MAX_ATTEMPTS) {
                        throw new Error(
                            "Gagal terhubung ke printer setelah 3x percobaan. Pastikan printer menyala dan scanner tidak sedang mengirim data.",
                        );
                    }
                    await this.delay(1500);
                }
            }

            console.log("GATT Terhubung. Mengambil Service...");

            const service = await server.getPrimaryService(
                printerConfig.service,
            );
            const characteristic = await service.getCharacteristic(
                printerConfig.characteristic,
            );

            console.log("Service ditemukan. Memulai pengiriman data...");

            const CHUNK_SIZE = 40;

            for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
                const chunk = bytes.slice(i, i + CHUNK_SIZE);

                await this.withTimeout(
                    characteristic.writeValue(chunk),
                    3000,
                    "Printer tidak merespon saat mencetak. Periksa kertas/baterai.",
                );

                await this.delay(80);
            }

            console.log("Data terkirim ke buffer Android.");

            await this.delay(500);

            return true;
        } catch (error: any) {
            console.error("Bluetooth Print Error:", error);

            let userMsg = error.message;
            if (
                error.name === "NotFoundError" ||
                userMsg.includes("User cancelled")
            ) {
                userMsg = "Batal memilih printer.";
            } else if (userMsg.includes("NetworkError")) {
                userMsg =
                    "Koneksi putus di tengah jalan. Dekatkan tablet ke printer.";
            }

            throw new Error(userMsg);
        } finally {
            if (device && device.gatt && device.gatt.connected) {
                console.log("Memutus koneksi printer...");
                device.gatt.disconnect();
            }
        }
    }

    generateReceipt(transaction: Transaction, app_setting: Setting) {
        const e = this.encoder.initialize();

        e.align("left")
            .bold(true)
            .line(app_setting.app_name)
            .bold(false)
            .line(app_setting.app_address)
            .size("small")
            .line(ymdToIdDate(transaction.transaction_time, true))
            .line(`#${transaction.invoice_code}`)
            .line("-".repeat(this.width));

        e.align("left")
            .line(`Kasir : ${transaction.cashier?.name || "-"}`)
            .line(`Pelanggan : ${transaction.customer?.name || "Umum"}`);
        if (transaction.customer_id) {
            e.line(`No HP : ${transaction.customer?.phone || "-"}?`);
        }
        if (
            (transaction.point_earned > 0 || transaction.point_used > 0) &&
            transaction.customer_type != "general"
        ) {
            e.line(
                `Poin Terkini : ${(transaction.customer?.points as number) + transaction.point_earned - transaction.point_used}`,
            );
        }
        e.line("-".repeat(this.width));

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

            const leftPart = `${qty} x ${floatToIdCurrency(normalPrice)}`;
            const rightPartTop = floatToIdCurrency(realSubtotal);
            const rightPartBottom =
                subtotalDiff !== 0
                    ? `(${floatToIdCurrency(subtotalDiff)})`
                    : "";

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

            if (rightPartBottom) {
                const spacesBottom = this.width - rightPartBottom.length;
                if (spacesBottom > 0) {
                    e.line(" ".repeat(spacesBottom) + rightPartBottom);
                } else {
                    e.align("right").line(rightPartBottom).align("left");
                }
            }
        });

        e.line("-".repeat(this.width));

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
        const dpi = 8;
        const labelWidthMm = 40;
        const labelHeightMm = 30;
        const gapMm = 3;
        const horizontalGapMm = 5;

        const totalWidthMm =
            labelWidthMm * itemPerRow + horizontalGapMm * (itemPerRow - 1);

        commands += `SIZE ${totalWidthMm} mm,${labelHeightMm} mm\r\n`;
        commands += `GAP ${gapMm} mm,0 mm\r\n`;
        commands += `DIRECTION 1\r\n`;
        commands += `CLS\r\n`;

        const itemsToPrint: ProductVariant[] = [];
        variants.forEach((v) => {
            const copies = v.copies || 1;
            for (let i = 0; i < copies; i++) {
                itemsToPrint.push(v);
            }
        });

        for (let i = 0; i < itemsToPrint.length; i += itemPerRow) {
            const rowItems = itemsToPrint.slice(i, i + itemPerRow);

            commands += `CLS\r\n`;

            rowItems.forEach((item, index) => {
                const xOffsetDots =
                    index * (labelWidthMm * dpi + horizontalGapMm * dpi);
                const labelWidthDots = labelWidthMm * dpi;
                const paddingDots = 16;
                const labelCenterDots = xOffsetDots + labelWidthDots / 2;

                const titleText = item.product_name
                    ? item.product_name
                    : "Item";
                const titleWidthEst = titleText.length * 12;
                const titleX = Math.floor(labelCenterDots - titleWidthEst / 2);
                commands += `TEXT ${titleX},10,"0",0,12,12,"${titleText}"\r\n`;

                const sku = item.sku;
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

                commands += `BARCODE ${finalBarcodeX},50,"128",60,1,0,${narrow},${
                    narrow * 2
                },"${sku}"\r\n`;

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
                    commands += `TEXT ${leftX},${y},"0",0,9,9,"${leftText}"\r\n`;
                    const rightTextWidth = rightText.length * 12;
                    const rightTextX = rightX - rightTextWidth;
                    commands += `TEXT ${rightTextX},${y},"0",0,9,9,"${rightText}"\r\n`;
                };

                const color = (item.attributes.color || "").substring(0, 12);
                const priceBasic = `(Beli 1) ${formatPrice(
                    item.price_criteria.basic,
                )}`;
                printRow(color, priceBasic, currentY);

                currentY += lineHeight;
                const size = String(item.attributes.size || "").substring(
                    0,
                    12,
                );
                const price3 = `(Beli 3) ${formatPrice(
                    item.price_criteria.order_qty_3,
                )}`;
                printRow(size, price3, currentY);

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
}
