<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Get user's projects with documents
        $projects = Project::where('user_id', $user->id)
            ->with(['documents' => function($query) {
                $query->latest();
            }])
            ->get();

        return Inertia::render('Documents/Index', [
            'projects' => $projects,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,xlsx,xls|max:10240', // 10MB max
            'category' => 'required|in:Vertrag,Angebot,Technische Zeichnung,Fotos,Sonstiges',
            'description' => 'nullable|string',
        ]);

        // Check if user owns the project
        $project = Project::findOrFail($request->project_id);
        if ($project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();
        $filePath = $file->store('documents', 'public');
        $fileSize = $file->getSize();
        $fileType = $file->getClientOriginalExtension();

        $document = Document::create([
            'user_id' => auth()->id(),
            'project_id' => $request->project_id,
            'title' => $fileName,
            'description' => $request->description,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'file_type' => $fileType,
            'file_size' => $fileSize,
            'category' => $request->category,
        ]);

        return back()->with('success', 'Dokument erfolgreich hochgeladen');
    }

    public function download(Document $document)
    {
        // Check if user owns the document
        if ($document->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }

    public function destroy(Document $document)
    {
        // Check if user owns the document
        if ($document->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Delete file from storage
        Storage::disk('public')->delete($document->file_path);

        // Delete database record
        $document->delete();

        return back()->with('success', 'Dokument erfolgreich gelöscht');
    }
}
