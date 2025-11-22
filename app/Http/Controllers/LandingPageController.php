<?php

namespace App\Http\Controllers;

use App\Mail\WelcomeUserMail;
use App\Models\CompanySetting;
use App\Models\Lead;
use App\Models\Project;
use App\Models\RoofArea;
use App\Models\ExclusionZone;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    /**
     * Display the landing page solar planner
     */
    public function index(): Response
    {
        // Directly read from .env file to bypass system environment variables
        $envFile = base_path('.env');
        $geminiKey = 'PLACEHOLDER_API_KEY';
        $mapsKey = 'PLACEHOLDER_API_KEY';

        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (str_starts_with($line, 'GEMINI_API_KEY=')) {
                    $geminiKey = trim(substr($line, 15));
                } elseif (str_starts_with($line, 'GOOGLE_MAPS_API_KEY=')) {
                    $mapsKey = trim(substr($line, 20));
                }
            }
        }

        $settings = CompanySetting::getAllSettings();

        return Inertia::render('LandingPlanner', [
            'companyName' => $settings['company_name'] ?? config('app.name'),
            'googleMapsApiKey' => $mapsKey,
            'geminiApiKey' => $geminiKey,
            'companySettings' => $settings,
        ]);
    }

    /**
     * Submit lead and optionally create user account + project
     */
    public function submitLead(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'message' => ['nullable', 'string', 'max:1000'],
            'request_type' => ['required', 'in:quote,consultation'],
            'create_account' => ['required', 'boolean'],
            'project_data' => ['nullable', 'array'],
        ]);

        DB::beginTransaction();

        try {
            $user = null;
            $project = null;
            $generatedPassword = null;

            // If user wants to create account
            if ($validated['create_account']) {
                // Check if user already exists
                $existingUser = User::where('email', $validated['email'])->first();

                if ($existingUser) {
                    DB::rollBack();
                    return redirect()->back()->withErrors([
                        'email' => 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits. Bitte melden Sie sich an oder verwenden Sie eine andere E-Mail-Adresse.'
                    ]);
                }

                // Generate random password
                $generatedPassword = Str::random(12);

                // Create user
                $user = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => Hash::make($generatedPassword),
                    'phone' => $validated['phone'],
                    'email_verified_at' => now(), // Auto-verify
                ]);

                // Assign user role
                $user->assignRole('user');

                // Create project if project data exists
                if ($validated['project_data']) {
                    $projectData = $validated['project_data'];

                    $project = Project::create([
                        'user_id' => $user->id,
                        'name' => $projectData['name'] ?? 'Meine Solar-Planung',
                        'location_lat' => $projectData['location_lat'] ?? 0,
                        'location_lng' => $projectData['location_lng'] ?? 0,
                        'map_center' => $projectData['map_center'] ?? [0, 0],
                        'zoom' => $projectData['zoom'] ?? 18,
                        'total_panel_count' => $projectData['total_panel_count'] ?? 0,
                        'status' => 'draft',
                    ]);

                    // Create roof areas
                    if (isset($projectData['roof_areas']) && is_array($projectData['roof_areas'])) {
                        foreach ($projectData['roof_areas'] as $roofAreaData) {
                            $roofArea = RoofArea::create([
                                'project_id' => $project->id,
                                'name' => $roofAreaData['name'] ?? 'Dachfläche',
                                'path' => $roofAreaData['path'] ?? [],
                                'panel_type' => $roofAreaData['panel_type'] ?? 'standard',
                                'tilt_angle' => $roofAreaData['tilt_angle'] ?? 30,
                                'orientation_angle' => $roofAreaData['orientation_angle'] ?? 180,
                                'panel_count' => $roofAreaData['panel_count'] ?? 0,
                            ]);

                            // Create exclusion zones
                            if (isset($roofAreaData['exclusion_zones']) && is_array($roofAreaData['exclusion_zones'])) {
                                foreach ($roofAreaData['exclusion_zones'] as $zoneData) {
                                    ExclusionZone::create([
                                        'roof_area_id' => $roofArea->id,
                                        'name' => $zoneData['name'] ?? 'Ausschlusszone',
                                        'path' => $zoneData['path'] ?? [],
                                    ]);
                                }
                            }
                        }
                    }
                }
            }

            // Create lead entry (always)
            $lead = Lead::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'message' => $validated['message'],
                'request_type' => $validated['request_type'],
                'status' => 'new',
                'source' => 'landing_page',
                'account_created' => $validated['create_account'],
                'project_id' => $project?->id,
            ]);

            // Send welcome email if account was created
            if ($user && $generatedPassword && $project) {
                Mail::to($user->email)->send(
                    new WelcomeUserMail(
                        $user->name,
                        $user->email,
                        $generatedPassword,
                        $project->name
                    )
                );
            }

            DB::commit();

            // Redirect to thank you page
            return redirect()->route('thank-you', [
                'account' => $validated['create_account'] ? 'true' : 'false'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Landing page submission error: ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'message' => 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
            ])->withInput();
        }
    }
}
