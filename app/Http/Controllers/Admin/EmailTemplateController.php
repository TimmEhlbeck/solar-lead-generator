<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmailTemplateController extends Controller
{
    /**
     * Display a listing of email templates.
     */
    public function index(Request $request)
    {
        $templates = EmailTemplate::all();

        return Inertia::render('Admin/EmailTemplates', [
            'auth' => [
                'user' => $request->user()->load('roles'),
            ],
            'templates' => $templates,
        ]);
    }

    /**
     * Display the specified email template.
     */
    public function show(Request $request, $id)
    {
        $template = EmailTemplate::findOrFail($id);

        return response()->json($template);
    }

    /**
     * Update the specified email template.
     */
    public function update(Request $request, $id)
    {
        $template = EmailTemplate::findOrFail($id);

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $template->update($validated);

        return redirect()->back()->with('success', 'Email-Template erfolgreich aktualisiert');
    }

    /**
     * Preview the email template with sample data.
     */
    public function preview(Request $request, $id)
    {
        $template = EmailTemplate::findOrFail($id);

        $validated = $request->validate([
            'data' => 'required|array',
        ]);

        $rendered = $template->render($validated['data']);

        return response()->json($rendered);
    }
}
