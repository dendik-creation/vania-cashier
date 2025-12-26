<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductReject;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class ProductRejectController extends Controller
{
    public function getProductVariantsOptions(Request $request)
    {
        $variants = ProductVariant::with('product')
            ->whereHas('product', function ($q) use ($request) {
                $q->when($request && $request->search, function ($query) use ($request) {
                    $query->where('name', 'like', '%' . $request->search . '%');
                });
            })
            ->orWhere(function ($query) use ($request) {
                if ($request && $request->search) {
                    $query->where('sku', 'like', '%' . $request->search . '%');
                }
            })
            ->limit(10)
            ->get();

        $options = $variants->map(function ($variant) {
            return [
                'value' => $variant->id,
                'label' => $variant->product->name . ' (' . $variant->sku . ')',
            ];
        });

        return response()->json($options);
    }
    public function index(Request $request)
    {
        $query = ProductReject::query()->with(['variant.product']);

        if ($request->search) {
            $query->whereHas('variant.product', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            })->orWhereHas('variant', function ($q) use ($request) {
                $q->where('sku', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $product_rejects = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/ProductReject/Index', [
            "title" => "Produk Reject",
            "description" => "Product reject yang akan diganti oleh pemasok dalam waktu tertentu.",
            'product_rejects' => $product_rejects,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string',
            'rejected_at' => 'required|date',
        ]);

        DB::transaction(function () use ($request) {
            $variant = ProductVariant::findOrFail($request->variant_id);
            
            if ($variant->stock < $request->quantity) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'quantity' => 'Stok tidak mencukupi.',
                ]);
            }

            ProductReject::create([
                'variant_id' => $request->variant_id,
                'quantity' => $request->quantity,
                'reason' => $request->reason,
                'rejected_at' => $request->rejected_at,
                'status' => 'pending',
            ]);

            $variant->decrement('stock', $request->quantity);
        });

        Session::flash('success', 'Produk reject berhasil ditambahkan.');
        return Inertia::location(route('admin.product-rejects.index'));
    }

    public function update($id, Request $request)
    {
        $reject = ProductReject::findOrFail($id);
        
        $request->validate([
            'reason' => 'required|string',
            'rejected_at' => 'required|date',
            'status' => 'required|in:pending,done',
        ]);

        DB::transaction(function () use ($reject, $request) {
            if ($reject->status !== $request->status) {
                if ($request->status === 'done') {
                    $reject->variant->increment('stock', $reject->quantity);
                } else {
                    if ($reject->variant->stock < $reject->quantity) {
                         throw \Illuminate\Validation\ValidationException::withMessages([
                            'status' => 'Stok tidak mencukupi untuk mengembalikan status ke pending.',
                        ]);
                    }
                    $reject->variant->decrement('stock', $reject->quantity);
                }
            }

            $reject->update([
                'reason' => $request->reason,
                'rejected_at' => $request->rejected_at,
                'status' => $request->status,
            ]);
        });

        Session::flash('success', 'Produk reject berhasil diperbarui.');
        return Inertia::location(route('admin.product-rejects.index'));
    }

    public function destroy($id)
    {
        $reject = ProductReject::findOrFail($id);

        DB::transaction(function () use ($reject) {
            if ($reject->status === 'pending') {
                $reject->variant->increment('stock', $reject->quantity);
            }
            $reject->delete();
        });

        Session::flash('success', 'Produk reject berhasil dihapus.');
        return Inertia::location(route('admin.product-rejects.index'));
    }
}
