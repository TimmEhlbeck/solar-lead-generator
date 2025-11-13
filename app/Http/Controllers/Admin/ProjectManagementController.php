<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectManagementController extends Controller
{
    /**
     * Display all projects from all users
     */
    public function index(Request $request): Response
    {
        $projects = Project::with(['user', 'roofAreas'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'user_id' => $project->user_id,
                    'user_name' => $project->user->name,
                    'user_email' => $project->user->email,
                    'location_lat' => $project->location_lat,
                    'location_lng' => $project->location_lng,
                    'map_center' => $project->map_center,
                    'zoom' => $project->zoom,
                    'total_panel_count' => $project->total_panel_count,
                    'roof_areas_count' => $project->roofAreas->count(),
                    'status' => $project->status,
                    'created_at' => $project->created_at->format('d.m.Y H:i'),
                    'updated_at' => $project->updated_at->format('d.m.Y H:i'),
                ];
            });

        return Inertia::render('Admin/ProjectManagement', [
            'projects' => $projects,
        ]);
    }

    /**
     * Display a specific project with all details
     */
    public function show(Project $project): Response
    {
        $project->load(['user', 'roofAreas.exclusionZones']);

        $projectData = [
            'id' => $project->id,
            'name' => $project->name,
            'user' => [
                'id' => $project->user->id,
                'name' => $project->user->name,
                'email' => $project->user->email,
            ],
            'location_lat' => $project->location_lat,
            'location_lng' => $project->location_lng,
            'map_center' => $project->map_center,
            'zoom' => $project->zoom,
            'total_panel_count' => $project->total_panel_count,
            'status' => $project->status,
            'created_at' => $project->created_at->format('d.m.Y H:i'),
            'updated_at' => $project->updated_at->format('d.m.Y H:i'),
            'roof_areas' => $project->roofAreas->map(function ($roofArea) {
                return [
                    'id' => $roofArea->id,
                    'name' => $roofArea->name,
                    'path' => $roofArea->path,
                    'panel_type' => $roofArea->panel_type,
                    'tilt_angle' => $roofArea->tilt_angle,
                    'orientation_angle' => $roofArea->orientation_angle,
                    'panel_count' => $roofArea->panel_count,
                    'exclusion_zones' => $roofArea->exclusionZones->map(function ($zone) {
                        return [
                            'id' => $zone->id,
                            'name' => $zone->name,
                            'path' => $zone->path,
                        ];
                    }),
                ];
            }),
        ];

        return Inertia::render('Admin/ProjectDetail', [
            'project' => $projectData,
        ]);
    }

    /**
     * Delete a project
     */
    public function destroy(Project $project)
    {
        $project->delete();

        return redirect()->back()->with('success', 'Projekt erfolgreich gelöscht.');
    }
}
