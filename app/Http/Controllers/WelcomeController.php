<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    /**
     * Display the welcome page with solar planner.
     */
    public function index(Request $request): Response
    {
        $project = null;

        // If project ID is provided in query string, load that project
        if ($request->has('project') && $request->user()) {
            $projectId = $request->query('project');
            $loadedProject = Project::with(['roofAreas.exclusionZones'])
                ->where('id', $projectId)
                ->where('user_id', $request->user()->id)
                ->first();

            if ($loadedProject) {
                $project = [
                    'id' => $loadedProject->id,
                    'name' => $loadedProject->name,
                    'map_center' => $loadedProject->map_center,
                    'zoom' => $loadedProject->zoom,
                    'roof_areas' => $loadedProject->roofAreas->map(function ($roofArea) {
                        return [
                            'id' => $roofArea->id,
                            'name' => $roofArea->name,
                            'path' => $roofArea->path,
                            'panelType' => $roofArea->panel_type,
                            'tiltAngle' => $roofArea->tilt_angle,
                            'orientationAngle' => $roofArea->orientation_angle,
                            'panelCount' => $roofArea->panel_count,
                            'exclusionZones' => $roofArea->exclusionZones->map(function ($zone) {
                                return [
                                    'id' => $zone->id,
                                    'name' => $zone->name,
                                    'path' => $zone->path,
                                ];
                            })->toArray(),
                        ];
                    })->toArray(),
                ];
            }
        }

        return Inertia::render('Welcome', [
            'companyName' => config('app.name'),
            'googleMapsApiKey' => config('services.google.maps_api_key'),
            'geminiApiKey' => config('services.google.gemini_api_key'),
            'loadedProject' => $project,
        ]);
    }
}
