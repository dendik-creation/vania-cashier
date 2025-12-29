<?php

namespace App\Http\Controllers\global;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;

class ProfileController extends Controller
{
    public function profileUpdate(Request $request)
    {
        $auth = Auth::user();
        $validated = $request->validate([
            'username' => 'required|max:255|unique:users,username,' . $auth->id,
            'name' => 'required|max:255',
        ], [
            'username.unique' => 'Username sudah digunakan oleh user lain.',
        ]);
        $user = User::findOrFail($auth->id);
        $user->update($validated);
        Session::flash('success', 'Profil berhasil diperbarui.');
        return back();
    }

    public function checkPassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
        ]);

        $user = Auth::user();
        if (!$user || !Hash::check($request->current_password, $user->password)) {
            return response()->json(['valid' => false]);
        }

        return response()->json(['valid' => true]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|confirmed',
        ]);

        $user_id = Auth::user()->id;
        $user = User::find($user_id);
        if (!$user || !Hash::check($request->current_password, $user->password)) {
            return back()->withErrors([
                'message' => 'Password saat ini salah',
            ]);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        $auth_controller = new AuthController();
        return $auth_controller->signOut(true);
    }
}
