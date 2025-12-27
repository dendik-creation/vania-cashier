<?php

namespace App\Http\Controllers\Global;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use Mike42\Escpos\Printer;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;
use Mike42\Escpos\CapabilityProfile;

class PrinterController extends Controller
{
    public function printTransaction($transaction_id){
        // Cari data transaksi berdasarkan ID
        $transaction = Transaction::with(['items.variant.product', 'customer', 'cashier'])->find($transaction_id);

        if (!$transaction) {
            return;
        }

        try {
            // Cari printer yang sesuai , POS-80C (Namanya) dengan koneksi Bluetooth
            // Pastikan printer sudah di-share atau terinstall di Windows dengan nama "POS-80C"
            $connector = new WindowsPrintConnector("58mm Series Printer");
            
            // Load Simple Capability Profile
            $profile = CapabilityProfile::load("simple");
            $printer = new Printer($connector, $profile);

            // Initialize
            $printer->initialize();

            // Header
            $printer->setJustification(Printer::JUSTIFY_CENTER);
            $printer->selectPrintMode(Printer::MODE_DOUBLE_WIDTH | Printer::MODE_EMPHASIZED);
            $printer->text("VANIA CASHIER\n");
            $printer->selectPrintMode(); // Reset
            $printer->text("Jl. Raya No. 123, Kota\n");
            $printer->text("Telp: 0812-3456-7890\n");
            $printer->text(str_repeat("-", 32) . "\n");
            
            // Info Transaksi
            $printer->setJustification(Printer::JUSTIFY_LEFT);
            $this->printRow($printer, "No. Inv", ": " . $transaction->invoice_code);
            $this->printRow($printer, "Tanggal", ": " . $transaction->created_at->format('d-m-Y H:i'));
            $this->printRow($printer, "Kasir", ": " . ($transaction->cashier->name ?? '-'));
            $this->printRow($printer, "Pelanggan", ": " . ($transaction->customer->name ?? 'Umum'));
            $printer->text(str_repeat("-", 32) . "\n");

            // Items
            foreach ($transaction->items as $item) {
                $productName = $item->variant->product->name ?? 'Item';
                $attributes = $item->variant->attributes ?? [];
                $attrString = "";
                if (!empty($attributes)) {
                    $attrParts = [];
                    foreach ($attributes as $key => $val) {
                        $attrParts[] = "$val";
                    }
                    $attrString = " (" . implode(", ", $attrParts) . ")";
                }
                
                $printer->setEmphasis(true);
                $printer->text($productName . $attrString . "\n");
                $printer->setEmphasis(false);

                $qty = $item->quantity;
                $price = number_format($item->price_per_item, 0, ',', '.');
                $subtotal = number_format($item->subtotal, 0, ',', '.');

                // Format: 2 x 50.000           100.000
                $leftText = "$qty x $price";
                $this->printRow($printer, $leftText, $subtotal);
            }
            
            $printer->text(str_repeat("-", 32) . "\n");

            // Totals
            $this->printRow($printer, "Subtotal", number_format($transaction->subtotal, 0, ',', '.'));
            if ($transaction->discount > 0) {
                $this->printRow($printer, "Diskon", "-" . number_format($transaction->discount, 0, ',', '.'));
            }
            if ($transaction->admin_fee > 0) {
                $this->printRow($printer, "Biaya Admin", number_format($transaction->admin_fee, 0, ',', '.'));
            }
            
            $printer->text(str_repeat("-", 32) . "\n");
            $printer->selectPrintMode(Printer::MODE_DOUBLE_WIDTH | Printer::MODE_EMPHASIZED);
            $this->printRow($printer, "TOTAL", number_format($transaction->total, 0, ',', '.'));
            $printer->selectPrintMode();
            
            // Footer
            $printer->text("\n");
            $printer->setJustification(Printer::JUSTIFY_CENTER);
            $printer->text("Terima Kasih\n");
            $printer->text("Barang yang sudah dibeli\n");
            $printer->text("tidak dapat ditukar/dikembalikan\n");
            
            $printer->feed(3);
            $printer->cut();
            
            $printer->close();

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            // Log error
            \Illuminate\Support\Facades\Log::error("Printer Error: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    private function printRow($printer, $label, $value) {
        $width = 32; // 58mm printer usually 32 chars
        
        $lenLabel = strlen($label);
        $lenValue = strlen($value);
        $spaces = $width - $lenLabel - $lenValue;
        if ($spaces < 0) $spaces = 1;
        
        $printer->text($label . str_repeat(" ", $spaces) . $value . "\n");
    }
}
