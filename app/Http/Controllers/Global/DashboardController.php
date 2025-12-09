<?php

namespace App\Http\Controllers\Global;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function adminDashboard()
    {
        return Inertia::render("Admin/Dashboard", [
            "title" => "Dashboard",
            "description" =>
                "Ringkasan informasi mengenai data yang ada disistem",
        ]);
    }
}
