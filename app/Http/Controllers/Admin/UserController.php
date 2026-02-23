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
        $users = User::whereNot(
            "username",
            config("custom.default.injectable_username"),
        )
            ->when($by_search, function ($query, $by_search) {
                $query
                    ->where("name", "like", "%" . $by_search . "%")
                    ->orWhere("username", "like", "%" . $by_search . "%")
                    ->whereNot(
                        "username",
                        config("custom.default.injectable_username"),
                    );
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
        $request->validate(
            [
                "name" => "required|string|max:255",
                "username" => "required|string|unique:users,username|max:255",
                "password" => "required|string|min:6",
                "role" => "required|in:admin,cashier",
            ],
            [
                "username.unique" => "Username sudah digunakan",
                "password.min" => "Password minimal 6 karakter",
            ],
        );

        User::create([
            "name" => $request->name,
            "username" => $request->username,
            "password" => $request->password,
            "role" => $request->role,
            "joined_at" => now(),
        ]);

        Session::flash("success", "User berhasil ditambahkan");
        return Inertia::location(route("admin.users.index"));
    }

    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate(
            [
                "name" => "required|string|max:255",
                "username" =>
                    "required|string|unique:users,username," . $id . "|max:255",
                "password" => "nullable|string|min:6",
                "role" => "required|in:admin,cashier",
            ],
            [
                "username.unique" => "Username sudah digunakan",
                "password.min" => "Password minimal 6 karakter",
            ],
        );

        $updateData = [
            "name" => $request->name,
            "username" => $request->username,
            "role" => $request->role,
        ];

        if ($request->filled("password")) {
            $updateData["password"] = $request->password;
        }

        $user->update($updateData);
        Session::flash("success", "User berhasil diperbarui");
        return Inertia::location("/admin/users");
    }

    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        Session::flash("success", "User berhasil dihapus");
        return Inertia::location("/admin/users");
    }

    public function resetPassword($id, Request $request)
    {
        $user = User::findOrFail($id);
        if (!$user) {
            Session::flash("error", "User tidak ditemukan");
            return Inertia::location("/admin/users");
        }

        $validated = $request->validate([
            "password" => "required",
        ]);

        $user->update([
            "password" => Hash::make($validated["password"]),
        ]);

        Session::flash("success", "Password berhasil direset");
        return Inertia::location("/admin/users");
    }
}
