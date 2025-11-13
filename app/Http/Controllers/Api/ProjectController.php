<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectController extends Controller
{
    /**
     * Display a listing of the user's projects.
     */
    public function index(Request $request)
    {
        $projects = $request->user()
            ->projects()
            ->with(['roofAreas.exclusionZones'])
            ->latest()
            ->get();

        return ProjectResource::collection($projects);
    }

    /**
     * Store a newly created project in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location_lat' => 'required|numeric|between:-90,90',
            'location_lng' => 'required|numeric|between:-180,180',
            'map_center' => 'nullable|array',
            'zoom' => 'nullable|integer|min:1|max:22',
            'roof_areas' => 'nullable|array',
            'roof_areas.*.name' => 'required|string',
            'roof_areas.*.path' => 'required|array',
            'roof_areas.*.panel_type' => 'required|string',
            'roof_areas.*.tilt_angle' => 'required|numeric',
            'roof_areas.*.orientation_angle' => 'required|numeric',
            'roof_areas.*.panel_count' => 'required|integer|min:0',
            'roof_areas.*.exclusion_zones' => 'nullable|array',
            'roof_areas.*.exclusion_zones.*.name' => 'required|string',
            'roof_areas.*.exclusion_zones.*.path' => 'required|array',
        ]);

        $project = DB::transaction(function () use ($request, $validated) {
            // Create project
            $project = $request->user()->projects()->create([
                'name' => $validated['name'],
                'location_lat' => $validated['location_lat'],
                'location_lng' => $validated['location_lng'],
                'map_center' => $validated['map_center'] ?? null,
                'zoom' => $validated['zoom'] ?? 20,
                'status' => 'draft',
            ]);

            // Create roof areas if provided
            if (isset($validated['roof_areas'])) {
                foreach ($validated['roof_areas'] as $roofAreaData) {
                    $exclusionZones = $roofAreaData['exclusion_zones'] ?? [];
                    unset($roofAreaData['exclusion_zones']);

                    $roofArea = $project->roofAreas()->create($roofAreaData);

                    // Create exclusion zones for this roof area
                    foreach ($exclusionZones as $exclusionZoneData) {
                        $roofArea->exclusionZones()->create($exclusionZoneData);
                    }
                }

                // Update total panel count
                $totalPanels = $project->roofAreas()->sum('panel_count');
                $project->update(['total_panel_count' => $totalPanels]);
            }

            return $project->load(['roofAreas.exclusionZones']);
        });

        return new ProjectResource($project);
    }

    /**
     * Display the specified project.
     */
    public function show(Request $request, Project $project)
    {
        // Ensure user owns this project
        if ($project->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to project');
        }

        return new ProjectResource($project->load(['roofAreas.exclusionZones']));
    }

    /**
     * Update the specified project in storage.
     */
    public function update(Request $request, Project $project)
    {
        // Ensure user owns this project
        if ($project->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to project');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'location_lat' => 'sometimes|numeric|between:-90,90',
            'location_lng' => 'sometimes|numeric|between:-180,180',
            'map_center' => 'nullable|array',
            'zoom' => 'nullable|integer|min:1|max:22',
            'status' => 'sometimes|in:draft,analyzing,completed',
            'roof_areas' => 'nullable|array',
            'roof_areas.*.name' => 'required|string',
            'roof_areas.*.path' => 'required|array',
            'roof_areas.*.panel_type' => 'required|string',
            'roof_areas.*.tilt_angle' => 'required|numeric',
            'roof_areas.*.orientation_angle' => 'required|numeric',
            'roof_areas.*.panel_count' => 'required|integer|min:0',
            'roof_areas.*.exclusion_zones' => 'nullable|array',
            'roof_areas.*.exclusion_zones.*.name' => 'required|string',
            'roof_areas.*.exclusion_zones.*.path' => 'required|array',
        ]);

        DB::transaction(function () use ($project, $validated) {
            // Update project basic info
            $project->update(array_intersect_key($validated, array_flip([
                'name', 'location_lat', 'location_lng', 'map_center', 'zoom', 'status'
            ])));

            // Update roof areas if provided
            if (isset($validated['roof_areas'])) {
                // Delete existing roof areas and their exclusion zones
                $project->roofAreas()->delete();

                // Create new roof areas
                foreach ($validated['roof_areas'] as $roofAreaData) {
                    $exclusionZones = $roofAreaData['exclusion_zones'] ?? [];
                    unset($roofAreaData['exclusion_zones']);

                    $roofArea = $project->roofAreas()->create($roofAreaData);

                    // Create exclusion zones
                    foreach ($exclusionZones as $exclusionZoneData) {
                        $roofArea->exclusionZones()->create($exclusionZoneData);
                    }
                }

                // Update total panel count
                $totalPanels = $project->roofAreas()->sum('panel_count');
                $project->update(['total_panel_count' => $totalPanels]);
            }
        });

        return new ProjectResource($project->load(['roofAreas.exclusionZones']));
    }

    /**
     * Remove the specified project from storage.
     */
    public function destroy(Request $request, Project $project)
    {
        // Ensure user owns this project
        if ($project->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to project');
        }

        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }
}
