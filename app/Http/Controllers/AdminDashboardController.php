<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use App\Models\Lead;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Display the admin dashboard with statistics and all projects
     */
    public function index(Request $request): Response
    {
        // Get statistics
        $totalUsers = User::count();
        $totalProjects = Project::count();
        $totalLeads = Lead::count();
        $totalPanels = Project::sum('total_panel_count');

        // Get recent projects from all users
        $recentProjects = Project::with(['user', 'roofAreas'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'user_name' => $project->user->name,
                    'user_email' => $project->user->email,
                    'location_lat' => $project->location_lat,
                    'location_lng' => $project->location_lng,
                    'total_panel_count' => $project->total_panel_count,
                    'roof_areas_count' => $project->roofAreas->count(),
                    'status' => $project->status,
                    'created_at' => $project->created_at->format('d.m.Y H:i'),
                    'updated_at' => $project->updated_at->format('d.m.Y H:i'),
                ];
            });

        // Get recent leads
        $recentLeads = Lead::orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($lead) {
                return [
                    'id' => $lead->id,
                    'name' => $lead->name,
                    'email' => $lead->email,
                    'phone' => $lead->phone,
                    'address' => $lead->address,
                    'status' => $lead->status,
                    'created_at' => $lead->created_at->format('d.m.Y H:i'),
                ];
            });

        // Get project statistics by status
        $projectsByStatus = Project::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        return Inertia::render('Admin/Dashboard', [
            'statistics' => [
                'total_users' => $totalUsers,
                'total_projects' => $totalProjects,
                'total_leads' => $totalLeads,
                'total_panels' => $totalPanels,
            ],
            'recent_projects' => $recentProjects,
            'recent_leads' => $recentLeads,
            'projects_by_status' => $projectsByStatus,
        ]);
    }
}
