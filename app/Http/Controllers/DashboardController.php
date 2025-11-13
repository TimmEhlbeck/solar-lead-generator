<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with user's projects.
     */
    public function index(Request $request)
    {
        $projects = $request->user()
            ->projects()
            ->with(['roofAreas.exclusionZones', 'timelineEvents.creator'])
            ->latest()
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'location_lat' => $project->location_lat,
                    'location_lng' => $project->location_lng,
                    'total_panel_count' => $project->total_panel_count,
                    'status' => $project->status,
                    'created_at' => $project->created_at->format('d.m.Y H:i'),
                    'updated_at' => $project->updated_at->format('d.m.Y H:i'),
                    'roof_areas_count' => $project->roofAreas->count(),
                    'timeline_events' => $project->timelineEvents->map(function ($event) {
                        return [
                            'id' => $event->id,
                            'event_type' => $event->event_type,
                            'title' => $event->title,
                            'description' => $event->description,
                            'icon' => $event->icon,
                            'created_at' => $event->created_at->format('d.m.Y H:i'),
                            'creator' => $event->creator ? ['name' => $event->creator->name] : null,
                        ];
                    }),
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
            });

        return Inertia::render('Dashboard', [
            'projects' => $projects,
        ]);
    }
}
