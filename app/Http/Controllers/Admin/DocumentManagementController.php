<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;

class DocumentManagementController extends Controller
{
    /**
     * Display all documents from all users
     */
    public function index(Request $request): Response
    {
        $documents = Document::with(['user', 'project'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($document) {
                return [
                    'id' => $document->id,
                    'title' => $document->title,
                    'description' => $document->description,
                    'file_name' => $document->file_name,
                    'file_type' => $document->file_type,
                    'file_size' => $document->file_size,
                    'file_size_formatted' => $document->file_size_formatted,
                    'category' => $document->category,
                    'user_id' => $document->user_id,
                    'user_name' => $document->user->name,
                    'user_email' => $document->user->email,
                    'project_id' => $document->project_id,
                    'project_name' => $document->project?->name,
                    'created_at' => $document->created_at->format('d.m.Y H:i'),
                    'updated_at' => $document->updated_at->format('d.m.Y H:i'),
                ];
            });

        return Inertia::render('Admin/DocumentManagement', [
            'documents' => $documents,
        ]);
    }

    /**
     * Download a document
     */
    public function download(Document $document)
    {
        if (!Storage::exists($document->file_path)) {
            return redirect()->back()->withErrors(['error' => 'Datei nicht gefunden.']);
        }

        return Storage::download($document->file_path, $document->file_name);
    }

    /**
     * Delete a document
     */
    public function destroy(Document $document)
    {
        // Delete the file from storage
        if (Storage::exists($document->file_path)) {
            Storage::delete($document->file_path);
        }

        $document->delete();

        return redirect()->back()->with('success', 'Dokument erfolgreich gelöscht.');
    }
}
