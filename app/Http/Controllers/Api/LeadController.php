<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeadResource;
use App\Models\Lead;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    /**
     * Display a listing of leads (for salespeople and admins).
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Admins see all leads, salespeople see assigned leads
        if ($user->hasRole('admin')) {
            $leads = Lead::with('assignedSalesperson')
                ->latest()
                ->paginate(50);
        } elseif ($user->hasRole('salesperson')) {
            $leads = $user->assignedLeads()
                ->latest()
                ->paginate(50);
        } else {
            abort(403, 'Unauthorized access to leads');
        }

        return LeadResource::collection($leads);
    }

    /**
     * Store a newly created lead (public endpoint for contact form).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'message' => 'nullable|string|max:2000',
            'request_type' => 'required|in:quote,consultation',
            'source' => 'nullable|string|max:100',
        ]);

        $validated['status'] = 'new';
        $validated['source'] = $validated['source'] ?? 'website';

        $lead = Lead::create($validated);

        // TODO: Send notification email to admin/sales team

        return new LeadResource($lead);
    }

    /**
     * Display the specified lead.
     */
    public function show(Request $request, Lead $lead)
    {
        $user = $request->user();

        // Check permissions
        if (!$user->hasRole('admin') && $lead->assigned_to !== $user->id) {
            abort(403, 'Unauthorized access to this lead');
        }

        return new LeadResource($lead->load('assignedSalesperson'));
    }

    /**
     * Update the specified lead.
     */
    public function update(Request $request, Lead $lead)
    {
        $user = $request->user();

        // Check permissions
        if (!$user->hasRole('admin') && $lead->assigned_to !== $user->id) {
            abort(403, 'Unauthorized to update this lead');
        }

        $validated = $request->validate([
            'status' => 'sometimes|in:new,contacted,qualified,converted,lost',
            'notes' => 'nullable|string|max:2000',
        ]);

        $lead->update($validated);

        return new LeadResource($lead->load('assignedSalesperson'));
    }

    /**
     * Assign lead to a salesperson (admin only).
     */
    public function assign(Request $request, Lead $lead)
    {
        if (!$request->user()->hasRole('admin')) {
            abort(403, 'Only admins can assign leads');
        }

        $validated = $request->validate([
            'salesperson_id' => 'required|exists:users,id',
        ]);

        $lead->update(['assigned_to' => $validated['salesperson_id']]);

        return new LeadResource($lead->load('assignedSalesperson'));
    }

    /**
     * Remove the specified lead.
     */
    public function destroy(Request $request, Lead $lead)
    {
        if (!$request->user()->hasRole('admin')) {
            abort(403, 'Only admins can delete leads');
        }

        $lead->delete();

        return response()->json(['message' => 'Lead deleted successfully']);
    }
}
