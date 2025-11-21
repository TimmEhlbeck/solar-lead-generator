<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    /**
     * Display a listing of all users
     */
    public function index(): Response
    {
        $users = User::with('roles')
            ->withCount('projects')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at?->format('d.m.Y H:i'),
                    'is_admin' => $user->hasRole('admin'),
                    'roles' => $user->roles->pluck('name'),
                    'projects_count' => $user->projects_count,
                    'created_at' => $user->created_at->format('d.m.Y H:i'),
                ];
            });

        $roles = Role::all()->pluck('name');

        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(), // Auto-verify admin created users
        ]);

        // Assign role
        $user->assignRole($validated['role']);

        return redirect()->back()->with('success', 'Benutzer erfolgreich erstellt.');
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        // Update password if provided
        if (!empty($validated['password'])) {
            $user->update([
                'password' => Hash::make($validated['password']),
            ]);
        }

        // Update role
        $user->syncRoles([]); // Remove all roles first
        $user->assignRole($validated['role']);

        return redirect()->back()->with('success', 'Benutzer erfolgreich aktualisiert.');
    }

    /**
     * Verify user email
     */
    public function verify(User $user)
    {
        if ($user->email_verified_at) {
            return redirect()->route('admin.users.index')->withErrors(['error' => 'Benutzer ist bereits verifiziert.']);
        }

        $user->update([
            'email_verified_at' => now(),
        ]);

        return redirect()->route('admin.users.index')->with('success', 'Benutzer erfolgreich verifiziert.');
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user)
    {
        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors(['error' => 'Sie können sich nicht selbst löschen.']);
        }

        $user->delete();

        return redirect()->back()->with('success', 'Benutzer erfolgreich gelöscht.');
    }
}
