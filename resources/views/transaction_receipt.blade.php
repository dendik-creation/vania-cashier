<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt</title>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 10px;
            margin: 0;
            padding: 0;
            width: 100%;
        }
        .container {
            width: 100%;
            padding: 5px;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .bold {
            font-weight: bold;
        }
        .line {
            border-bottom: 1px dashed #000;
            margin: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td, th {
            text-align: left;
            vertical-align: top;
        }
        .qty {
            width: 15%;
            text-align: center;
        }
        .price {
            width: 25%;
            text-align: right;
        }
        .item-name {
            width: 60%;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="text-center">
            @if(isset($settings->app_logo))
                <!-- <img src="{{ public_path($settings->app_logo) }}" alt="Logo" style="max-width: 50px;"> -->
            @endif
            <div class="bold" style="font-size: 12px;">{{ $settings->app_name ?? 'Vania Cashier' }}</div>
            <div>{{ $settings->app_address ?? '' }}</div>
        </div>
        
        <div class="line"></div>
        
        <div>
            Date: {{ $transaction->transaction_time->format('d/m/Y H:i') }}<br>
            Inv: {{ $transaction->id }}<br>
            Cashier: {{ $transaction->cashier->name ?? 'Admin' }}<br>
            Customer: {{ $transaction->customer->name ?? 'General' }}
        </div>
        
        <div class="line"></div>
        
        <table>
            <thead>
                <tr>
                    <th class="item-name">Item</th>
                    <th class="qty">Qty</th>
                    <th class="price">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($transaction->items as $item)
                <tr>
                    <td class="item-name">
                        {{ $item->variant->product->name }}<br>
                        <small>{{ $item->variant->sku }}</small>
                    </td>
                    <td class="qty">{{ $item->quantity }}</td>
                    <td class="price">{{ number_format($item->subtotal, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        
        <div class="line"></div>
        
        <table>
            <tr>
                <td>Subtotal</td>
                <td class="text-right">{{ number_format($transaction->subtotal, 0, ',', '.') }}</td>
            </tr>
            @if($transaction->discount > 0)
            <tr>
                <td>Discount</td>
                <td class="text-right">-{{ number_format($transaction->discount, 0, ',', '.') }}</td>
            </tr>
            @endif
            @if($transaction->admin_fee > 0)
            <tr>
                <td>Admin Fee</td>
                <td class="text-right">{{ number_format($transaction->admin_fee, 0, ',', '.') }}</td>
            </tr>
            @endif
            <tr class="bold" style="font-size: 12px;">
                <td>Total</td>
                <td class="text-right">{{ number_format($transaction->total, 0, ',', '.') }}</td>
            </tr>
        </table>
        
        <div class="line"></div>
        
        <div class="text-center">
            Thank you for your purchase!<br>
            Please come again.
        </div>
    </div>
</body>
</html>
