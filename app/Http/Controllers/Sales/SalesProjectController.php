<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalesProjectController extends Controller
{
    /**
     * Display all projects for sales team
     */
    public function index(): Response
    {
        $projects = Project::with(['user', 'timelineEvents.creator'])
            ->latest()
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'user_name' => $project->user ? $project->user->name : 'N/A',
                    'location_lat' => $project->location_lat,
                    'location_lng' => $project->location_lng,
                    'total_panel_count' => $project->total_panel_count,
                    'roof_areas_count' => $project->roofAreas->count(),
                    'status' => $project->status,
                    'created_at' => $project->created_at->format('d.m.Y H:i'),
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
                ];
            });

        return Inertia::render('Sales/Projects', [
            'projects' => $projects,
        ]);
    }
}
