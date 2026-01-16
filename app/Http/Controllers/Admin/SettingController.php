<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Spatie\Image\Image;

class SettingController extends Controller
{
    public function index()
    {
        $setting = Setting::first();
        $setting["product_types"] = implode(
            ",",
            (array) $setting["product_types"],
        );
        return Inertia::render("Admin/Setting/Index", [
            "title" => "Pengaturan Aplikasi",
            "description" => "Atur konfigurasi aplikasi sesuai kebutuhan.",
            "setting" => $setting,
        ]);
    }

    public function update(Request $request)
    {
        $rules = [
            "app_name" => "required|string|max:255",
            "app_address" => "required|string|max:255",
            "product_types" => "required|string",
            "eligible_point_minimum" => "required|integer|min:0",
            "idr_point_value" => "required|integer|min:0",
            "minimum_point_can_used" => "required|integer|min:0",
            "admin_fee_criteria" => "required|array|min:1",
            "admin_fee_criteria.*.payment_method" =>
                "required|string|in:qris,cash,transfer",
            "admin_fee_criteria.*.min_total" => "required|integer|min:0",
            "admin_fee_criteria.*.admin_fee" => "required|integer|min:0",
        ];

        if ($request->hasFile("app_logo")) {
            $rules["app_logo"] = "required|image|max:4096";
        } else {
            $rules["app_logo"] = "nullable";
        }

        $validated = $request->validate($rules, [
            "app_logo.max" => "Ukuran file maksimal 4MB",
        ]);
        $setting = Setting::first();
        if ($request->hasFile("app_logo")) {
            $file = $request->file("app_logo");
            $filename = "icon.png";
            $filename512 = "icon_512.png";

            // Convert and save the uploaded file as PNG in the public directory
            Image::load($file->getPathname())
                ->format("png")
                ->save(public_path($filename));

            // Resize to 512x512 and save as icon_512.png
            Image::load(public_path($filename))
                ->width(512)
                ->height(512)
                ->format("png")
                ->save(public_path($filename512));

            $validated["app_logo"] = "/{$filename}";
        } else {
            unset($validated["app_logo"]);
        }
        $validated["product_types"] = array_map(
            "trim",
            explode(",", $validated["product_types"]),
        );
        $setting->update($validated);
        Session::flash("success", "Pengaturan aplikasi berhasil diperbarui.");
        return Inertia::location(route("admin.settings.index"));
    }
}
