<?php

namespace App\Http\Controllers\Global;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function signedInStatus()
    {
        $auth = Auth::user();
        if (!$auth) {
            return Inertia::location("/auth/signin");
        }
        Session::flash("success", "Login berhasil");
        switch ($auth->role) {
            case "admin":
                return Inertia::location("/admin/dashboard");
            case "cashier":
                return Inertia::location("/cashier/dashboard");
            default:
                Auth::logout();
                Session::flash("error", "Role pengguna tidak dikenali");
        }
    }

    public function signInView()
    {
        return Inertia::render("Auth/SignIn", [
            "app_name" => config("app.name"),
        ]);
    }

    public function signIn(Request $request)
    {
        $credentials = $request->validate([
            "username" => "required",
            "password" => "required",
        ]);

        $user = User::where("username", $credentials["username"])->first();
        if (!$user || !Hash::check($credentials["password"], $user->password)) {
            return back()->withErrors([
                "message" => "Username atau password salah",
            ]);
        }

        if (Auth::attempt($credentials)) {
            return Inertia::location("/");
        }

        return back()->withErrors([
            "message" => "Authentication failed",
        ]);
    }

    public function signOut($password_changed = false)
    {
        Auth::logout();
        if ($password_changed) {
            Session::flash(
                "success",
                "Password berhasil diubah. Silakan login kembali.",
            );
        } else {
            Session::flash("success", "Logout berhasil");
        }
        return Inertia::location("/auth/signin");
    }
}
