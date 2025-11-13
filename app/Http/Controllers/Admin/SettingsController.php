<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    /**
     * Display the settings page
     */
    public function index(Request $request)
    {
        $settings = CompanySetting::getAllSettings();

        return Inertia::render('Admin/Settings', [
            'auth' => [
                'user' => $request->user()->load('roles'),
            ],
            'settings' => $settings,
        ]);
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'nullable|string|max:255',
            'company_logo' => 'nullable|file|image|max:2048',
            'primary_color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'secondary_color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'accent_color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'background_color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'text_color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
        ]);

        foreach ($validated as $key => $value) {
            if ($key === 'company_logo' && $value) {
                CompanySetting::uploadFile($key, $value);
            } elseif ($value !== null) {
                CompanySetting::set($key, $value);
            }
        }

        CompanySetting::clearCache();

        return redirect()->back()->with('success', 'Einstellungen erfolgreich aktualisiert');
    }

    /**
     * Delete logo
     */
    public function deleteLogo()
    {
        $logo = CompanySetting::where('key', 'company_logo')->first();

        if ($logo && $logo->value) {
            Storage::disk('public')->delete($logo->value);
            CompanySetting::set('company_logo', null, 'file');
            CompanySetting::clearCache();
        }

        return redirect()->back()->with('success', 'Logo erfolgreich gelöscht');
    }
}
