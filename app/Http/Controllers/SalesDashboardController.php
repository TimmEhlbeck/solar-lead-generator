<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SalesDashboardController extends Controller
{
    /**
     * Display the sales dashboard
     */
    public function index(): Response
    {
        $user = auth()->user();

        // Overall Lead Statistics
        $stats = [
            // Lead counts
            'total_leads' => Lead::count(),
            'my_leads' => Lead::where('assigned_to', $user->id)->count(),
            'new_leads' => Lead::where('status', 'new')->count(),
            'assigned_leads' => Lead::where('status', 'assigned')->count(),
            'contacted_leads' => Lead::where('status', 'contacted')->count(),
            'qualified_leads' => Lead::where('status', 'qualified')->count(),
            'converted_leads' => Lead::where('status', 'converted')->count(),
            'lost_leads' => Lead::where('status', 'lost')->count(),

            // Personal statistics
            'my_new_leads' => Lead::where('assigned_to', $user->id)->where('status', 'new')->count(),
            'my_contacted_leads' => Lead::where('assigned_to', $user->id)->where('status', 'contacted')->count(),
            'my_qualified_leads' => Lead::where('assigned_to', $user->id)->where('status', 'qualified')->count(),
            'my_converted_leads' => Lead::where('assigned_to', $user->id)->where('status', 'converted')->count(),

            // Conversion rates
            'conversion_rate' => $this->calculateConversionRate(),
            'my_conversion_rate' => $this->calculateMyConversionRate($user->id),

            // Projects
            'total_projects' => Project::count(),
            'my_projects' => Project::whereHas('lead', function ($query) use ($user) {
                $query->where('assigned_to', $user->id);
            })->count(),
        ];

        // Lead status breakdown for charts
        $statusBreakdown = [
            ['name' => 'Neu', 'value' => $stats['new_leads'], 'color' => '#3b82f6'],
            ['name' => 'Zugewiesen', 'value' => $stats['assigned_leads'], 'color' => '#8b5cf6'],
            ['name' => 'Kontaktiert', 'value' => $stats['contacted_leads'], 'color' => '#eab308'],
            ['name' => 'Qualifiziert', 'value' => $stats['qualified_leads'], 'color' => '#6366f1'],
            ['name' => 'Konvertiert', 'value' => $stats['converted_leads'], 'color' => '#10b981'],
            ['name' => 'Verloren', 'value' => $stats['lost_leads'], 'color' => '#6b7280'],
        ];

        // My lead status breakdown
        $myStatusBreakdown = [
            ['name' => 'Neu', 'value' => $stats['my_new_leads'], 'color' => '#3b82f6'],
            ['name' => 'Kontaktiert', 'value' => $stats['my_contacted_leads'], 'color' => '#eab308'],
            ['name' => 'Qualifiziert', 'value' => $stats['my_qualified_leads'], 'color' => '#6366f1'],
            ['name' => 'Konvertiert', 'value' => $stats['my_converted_leads'], 'color' => '#10b981'],
        ];

        // Get recent leads (all leads, newest first)
        $recentLeads = Lead::with(['assignedSalesperson', 'project'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($lead) {
                return [
                    'id' => $lead->id,
                    'name' => $lead->name,
                    'email' => $lead->email,
                    'phone' => $lead->phone,
                    'request_type' => $lead->request_type,
                    'status' => $lead->status,
                    'source' => $lead->source,
                    'assigned_to' => $lead->assignedSalesperson ? [
                        'id' => $lead->assignedSalesperson->id,
                        'name' => $lead->assignedSalesperson->name,
                    ] : null,
                    'project' => $lead->project ? [
                        'id' => $lead->project->id,
                        'name' => $lead->project->name,
                    ] : null,
                    'created_at' => $lead->created_at->format('d.m.Y H:i'),
                ];
            });

        // Get my leads that need attention (new or contacted)
        $myLeadsNeedingAttention = Lead::with(['project'])
            ->where('assigned_to', $user->id)
            ->whereIn('status', ['new', 'assigned', 'contacted'])
            ->orderBy('created_at', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($lead) {
                return [
                    'id' => $lead->id,
                    'name' => $lead->name,
                    'email' => $lead->email,
                    'phone' => $lead->phone,
                    'status' => $lead->status,
                    'created_at' => $lead->created_at->format('d.m.Y H:i'),
                    'days_old' => $lead->created_at->diffInDays(now()),
                ];
            });

        // Recent activity / timeline
        $recentActivity = $this->getRecentActivity($user->id);

        // Performance metrics for the last 30 days
        $performanceMetrics = $this->getPerformanceMetrics($user->id);

        return Inertia::render('Sales/Dashboard', [
            'stats' => $stats,
            'statusBreakdown' => $statusBreakdown,
            'myStatusBreakdown' => $myStatusBreakdown,
            'recentLeads' => $recentLeads,
            'myLeadsNeedingAttention' => $myLeadsNeedingAttention,
            'recentActivity' => $recentActivity,
            'performanceMetrics' => $performanceMetrics,
        ]);
    }

    /**
     * Calculate overall conversion rate
     */
    private function calculateConversionRate(): float
    {
        $totalLeads = Lead::whereIn('status', ['converted', 'lost'])->count();
        $convertedLeads = Lead::where('status', 'converted')->count();

        if ($totalLeads === 0) {
            return 0;
        }

        return round(($convertedLeads / $totalLeads) * 100, 1);
    }

    /**
     * Calculate user's conversion rate
     */
    private function calculateMyConversionRate(int $userId): float
    {
        $totalLeads = Lead::where('assigned_to', $userId)
            ->whereIn('status', ['converted', 'lost'])
            ->count();

        $convertedLeads = Lead::where('assigned_to', $userId)
            ->where('status', 'converted')
            ->count();

        if ($totalLeads === 0) {
            return 0;
        }

        return round(($convertedLeads / $totalLeads) * 100, 1);
    }

    /**
     * Get recent activity for the user
     */
    private function getRecentActivity(int $userId): array
    {
        $activities = [];

        // Recent lead assignments
        $recentAssignments = Lead::where('assigned_to', $userId)
            ->where('created_at', '>=', now()->subDays(7))
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($lead) {
                return [
                    'type' => 'lead_assigned',
                    'title' => 'Lead zugewiesen',
                    'description' => "Lead '{$lead->name}' wurde Ihnen zugewiesen",
                    'timestamp' => $lead->created_at->format('d.m.Y H:i'),
                    'lead_id' => $lead->id,
                ];
            })->toArray();

        $activities = array_merge($activities, $recentAssignments);

        // Sort by timestamp
        usort($activities, function ($a, $b) {
            return strcmp($b['timestamp'], $a['timestamp']);
        });

        return array_slice($activities, 0, 10);
    }

    /**
     * Get performance metrics for the last 30 days
     */
    private function getPerformanceMetrics(int $userId): array
    {
        $thirtyDaysAgo = now()->subDays(30);

        return [
            'leads_assigned_30d' => Lead::where('assigned_to', $userId)
                ->where('created_at', '>=', $thirtyDaysAgo)
                ->count(),
            'leads_contacted_30d' => Lead::where('assigned_to', $userId)
                ->whereIn('status', ['contacted', 'qualified', 'converted'])
                ->where('updated_at', '>=', $thirtyDaysAgo)
                ->count(),
            'leads_converted_30d' => Lead::where('assigned_to', $userId)
                ->where('status', 'converted')
                ->where('updated_at', '>=', $thirtyDaysAgo)
                ->count(),
            'response_time_avg' => $this->calculateAverageResponseTime($userId),
        ];
    }

    /**
     * Calculate average response time (in hours)
     */
    private function calculateAverageResponseTime(int $userId): float
    {
        // This would require tracking when leads were first contacted
        // For now, return a placeholder
        return 0;
    }
}
