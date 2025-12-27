import { floatToIdCurrency, ymdToIdDate } from "@/components/helper/helper";
import {
    getFromLocalStorage,
    saveToLocalStorage,
} from "@/components/helper/local_storage";
import { Setting } from "@/types/setting";
import { Transaction, TransactionItem } from "@/types/transaction";
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

let cachedDevice: any = null;

export const connectPrinter = async () => {
    const nav = navigator as any;
    if (!nav.bluetooth) throw new Error("Web Bluetooth tidak tersedia.");

    const device = await nav.bluetooth.requestDevice({
        filters: [{ name: PRINTERS.RECEIPT.name }],
        optionalServices: [PRINTERS.RECEIPT.service],
    });

    if (device) {
        cachedDevice = device;
        saveToLocalStorage("default_receipt_printer", device.id);

        // Set expired at 00:00 AM next day
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        saveToLocalStorage("printer_expired_at", tomorrow.getTime());

        return true;
    }
    return false;
};

export const checkPrinterConnection = async () => {
    const nav = navigator as any;
    if (!nav.bluetooth) return false;

    const deviceId = getFromLocalStorage("default_receipt_printer");
    const expiredAt = getFromLocalStorage("printer_expired_at");
    const now = new Date().getTime();

    if (!deviceId || !expiredAt || now > expiredAt) {
        return false;
    }

    if (cachedDevice && cachedDevice.id === deviceId) {
        return true;
    }

    // Try to retrieve from allowed devices
    if (nav.bluetooth.getDevices) {
        const devices = await nav.bluetooth.getDevices();
        const device = devices.find((d: any) => d.id === deviceId);
        if (device) {
            cachedDevice = device;
            return true;
        }
    }

    return false;
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
            .bold(false)
            .line(app_setting.app_address)
            .line(ymdToIdDate(transaction.transaction_time, true))
            .line("-".repeat(this.width));

        // Info
        e.align("left")
            .line(`INV : ${transaction.invoice_code}`)
            .line(`Kasir : ${transaction.cashier?.name || "-"}`)
            .line(`Pelanggan : ${transaction.customer?.name || "Umum"}`);
        if (
            (transaction.point_earned > 0 || transaction.point_used > 0) &&
            transaction.customer_type != "general"
        ) {
            e.line(
                `Poin : +${transaction.point_earned} / -${transaction.point_used}`
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
            const price = floatToIdCurrency(item.price_per_item);
            const subtotal = floatToIdCurrency(item.subtotal);

            // Format: 2 x 50.000           100.000
            const leftPart = `${qty} x ${price}`;
            const rightPart = subtotal;

            const spaces = this.width - leftPart.length - rightPart.length;
            if (spaces > 0) {
                e.line(leftPart + " ".repeat(spaces) + rightPart);
            } else {
                e.line(leftPart).align("right").line(rightPart).align("left");
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
        if (transaction.discount > 0)
            printRow("Diskon", "-" + formatCurrency(transaction.discount));
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

    async printLabel(bytes: Uint8Array) {
        return this.printToBluetooth(bytes, PRINTERS.LABEL);
    }

    private async printToBluetooth(
        bytes: Uint8Array,
        printerConfig: typeof PRINTERS.RECEIPT
    ) {
        if (!cachedDevice) {
            // Try to reconnect if not cached
            const isConnected = await checkPrinterConnection();
            if (!isConnected) {
                throw new Error(
                    "Printer belum terhubung. Silakan hubungkan printer terlebih dahulu."
                );
            }
        }

        try {
            const device = cachedDevice;
            if (!device.gatt.connected) {
                await device.gatt.connect();
            }

            const server = device.gatt;
            const service = await server.getPrimaryService(
                printerConfig.service
            );
            const characteristic = await service.getCharacteristic(
                printerConfig.characteristic
            );

            // Send data in chunks
            const chunkSize = 512;
            for (let i = 0; i < bytes.length; i += chunkSize) {
                const chunk = bytes.slice(i, i + chunkSize);
                await characteristic.writeValue(chunk);
            }

            // Keep connection alive for session or disconnect?
            // User wants "next transaction not required to search", so keeping it connected or reconnecting via ID is fine.
            // We won't disconnect explicitly to allow faster subsequent prints,
            // or we can disconnect and rely on cachedDevice to reconnect quickly.
            // Let's disconnect to save battery/resources, since we have the device object to reconnect.
            setTimeout(() => {
                if (device.gatt.connected) {
                    device.gatt.disconnect();
                }
            }, 2000);
        } catch (error) {
            console.error("Bluetooth Print Error:", error);
            throw error;
        }
    }
}
