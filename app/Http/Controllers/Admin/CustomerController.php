<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $by_search = $request->query("search");
        $by_type = $request->query("type");

        $customers = Customer::withCount("transactions")
            ->when($by_search, function ($query, $by_search) {
                $query
                    ->where("name", "like", "%" . $by_search . "%")
                    ->orWhere("phone", "like", "%" . $by_search . "%");
            })
            ->when($by_type, function ($query, $by_type) {
                $query->where("type", $by_type);
            })
            ->orderBy("joined_at", "desc")
            ->paginate(config("custom.default.pagination_size"));
        return Inertia::render("Admin/Customer/Index", [
            "title" => "Daftar Pelanggan",
            "description" =>
                "Halaman untuk melihat daftar pelanggan yang terdaftar di sistem.",
            "customers" => $customers,
            "filters" => [
                "search" => $by_search ?? "",
                "type" => $by_type ?? "",
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(
            [
                "name" => "required|string|max:255",
                "phone" => "required|string|unique:customers,phone|max:20",
                "address" => "nullable|string",
                "type" => "required|in:member,reseller",
            ],
            [
                "phone.unique" => "Nomor telepon sudah digunakan",
            ],
        );

        Customer::create([
            "name" => $request->name,
            "phone" => $request->phone,
            "address" => $request->address,
            "type" => $request->type,
            "joined_at" => now(),
        ]);

        Session::flash("success", "Pelanggan berhasil ditambahkan.");
        return Inertia::location(route("admin.customers.index"));
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $request->validate(
            [
                "name" => "required|string|max:255",
                "phone" =>
                    "required|string|unique:customers,phone," .
                    $customer->id .
                    "|max:20",
                "address" => "nullable|string",
                "type" => "required|in:member,reseller",
            ],
            [
                "phone.unique" => "Nomor telepon sudah digunakan",
            ],
        );

        $customer->update([
            "name" => $request->name,
            "phone" => $request->phone,
            "address" => $request->address,
            "type" => $request->type,
        ]);

        Session::flash("success", "Pelanggan berhasil diperbarui.");
        return Inertia::location(route("admin.customers.index"));
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();

        Session::flash("success", "Pelanggan berhasil dihapus.");
        return Inertia::location(route("admin.customers.index"));
    }
}
