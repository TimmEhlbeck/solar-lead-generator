<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectPlannerController extends Controller
{
    /**
     * Show the project planner for a new project
     */
    public function create(Request $request): Response
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

        return Inertia::render('LandingPlanner', [
            'companyName' => config('app.name'),
            'googleMapsApiKey' => $mapsKey,
            'geminiApiKey' => $geminiKey,
            'project' => null,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    /**
     * Show the project planner for editing an existing project
     */
    public function edit(Request $request, Project $project): Response
    {
        // Ensure user owns this project
        if ($project->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to project');
        }

        // Load project with relationships
        $project->load(['roofAreas.exclusionZones']);

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

        return Inertia::render('LandingPlanner', [
            'companyName' => config('app.name'),
            'googleMapsApiKey' => $mapsKey,
            'geminiApiKey' => $geminiKey,
            'project' => $project,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }
}
