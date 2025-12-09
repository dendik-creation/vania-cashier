<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $by_search = $request->query("search");
        $by_role = $request->query("role");
        $users = User::when($by_search, function ($query, $by_search) {
            $query
                ->where("name", "like", "%" . $by_search . "%")
                ->orWhere("username", "like", "%" . $by_search . "%");
        })
            ->when($by_role, function ($query, $by_role) {
                $query->where("role", $by_role);
            })
            ->orderBy("joined_at", "desc")
            ->paginate(config("custom.default.pagination_size"));
        return Inertia::render("Admin/User/Index", [
            "title" => "Daftar User",
            "description" =>
                "Halaman untuk melihat daftar user yang terdaftar di sistem.",
            "users" => $users,
            "filters" => [
                "search" => $by_search ?? "",
                "role" => $by_role ?? "",
            ],
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            "name" => "required|string|max:255",
            "username" => "required|string|unique:users,username|max:255",
            "password" => "required|string|min:6",
            "role" => "required|in:admin,cashier",
        ]);

        User::create([
            "name" => $request->name,
            "username" => $request->username,
            "password" => $request->password,
            "role" => $request->role,
            "joined_at" => now(),
        ]);

        return redirect()
            ->back()
            ->with("success", "User berhasil ditambahkan.");
    }

    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            "name" => "required|string|max:255",
            "username" =>
                "required|string|unique:users,username," . $id . "|max:255",
            "password" => "nullable|string|min:6",
            "role" => "required|in:admin,cashier",
        ]);

        $updateData = [
            "name" => $request->name,
            "username" => $request->username,
            "role" => $request->role,
        ];

        if ($request->filled("password")) {
            $updateData["password"] = $request->password;
        }

        $user->update($updateData);

        return redirect()->back()->with("success", "User berhasil diperbarui.");
    }

    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->back()->with("success", "User berhasil dihapus.");
    }

    public function resetPassword($id, Request $request)
    {
        $user = User::findOrFail($id);
        if (!$user) {
            Session::flash("error", "User tidak ditemukan");
            return Inertia::location(route("admin.users.index"));
        }

        $validated = $request->validate([
            "password" => "required",
        ]);

        $user->update([
            "password" => Hash::make($validated["password"]),
        ]);

        Session::flash("success", "Password user berhasil direset");
        return Inertia::location(route("admin.users.index"));
    }
}
