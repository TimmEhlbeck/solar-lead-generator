<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\SalesDashboardController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\ProjectManagementController;
use App\Http\Controllers\Admin\DocumentManagementController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\ProjectPlannerController;
use App\Http\Controllers\TimelineEventController;
use App\Http\Controllers\Sales\SalesProjectController;
use App\Http\Controllers\Sales\LeadController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [WelcomeController::class, 'index'])->name('welcome');

// Landing Page Routes (public, for Meta Ads)
Route::get('/solar-planer', [LandingPageController::class, 'index'])->name('landing.planner');
Route::post('/solar-planer/submit', [LandingPageController::class, 'submitLead'])->name('landing.submit');

// Thank You Page
Route::get('/danke', function() {
    $hasAccount = request('account') === 'true';
    return Inertia::render('ThankYou', ['hasAccount' => $hasAccount]);
})->name('thank-you');

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

// Sales Routes
Route::middleware(['auth', 'verified', 'sales'])->prefix('sales')->group(function () {
    Route::get('/dashboard', [SalesDashboardController::class, 'index'])->name('sales.dashboard');
    Route::get('/projects', [SalesProjectController::class, 'index'])->name('sales.projects');

    // Lead Management
    Route::get('/leads', [LeadController::class, 'index'])->name('sales.leads');
    Route::get('/leads/{lead}', [LeadController::class, 'show'])->name('sales.leads.show');
    Route::put('/leads/{lead}/assign', [LeadController::class, 'assign'])->name('sales.leads.assign');
    Route::put('/leads/{lead}/status', [LeadController::class, 'updateStatus'])->name('sales.leads.updateStatus');
    Route::post('/leads/{lead}/notes', [LeadController::class, 'addNote'])->name('sales.leads.addNote');
    Route::delete('/leads/{lead}/notes/{note}', [LeadController::class, 'deleteNote'])->name('sales.leads.deleteNote');

    // Timeline event routes (sales can create events and update status)
    Route::post('/projects/{project}/timeline', [TimelineEventController::class, 'store'])->name('sales.timeline.store');
    Route::put('/projects/{project}/status', [TimelineEventController::class, 'updateStatus'])->name('sales.projects.updateStatus');
});

// Admin Routes
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    // User Management
    Route::get('/users', [UserManagementController::class, 'index'])->name('admin.users.index');
    Route::post('/users', [UserManagementController::class, 'store'])->name('admin.users.store');
    Route::put('/users/{user}', [UserManagementController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->name('admin.users.destroy');

    // Project Management
    Route::get('/projects', [ProjectManagementController::class, 'index'])->name('admin.projects.index');
    Route::get('/projects/{project}', [ProjectManagementController::class, 'show'])->name('admin.projects.show');
    Route::delete('/projects/{project}', [ProjectManagementController::class, 'destroy'])->name('admin.projects.destroy');

    // Document Management
    Route::get('/documents', [DocumentManagementController::class, 'index'])->name('admin.documents.index');
    Route::get('/documents/{document}/download', [DocumentManagementController::class, 'download'])->name('admin.documents.download');
    Route::delete('/documents/{document}', [DocumentManagementController::class, 'destroy'])->name('admin.documents.destroy');

    // Timeline event routes (admin can delete events)
    Route::delete('/projects/{project}/timeline/{event}', [TimelineEventController::class, 'destroy'])->name('admin.timeline.destroy');

    // Settings Management
    Route::get('/settings', [SettingsController::class, 'index'])->name('admin.settings.index');
    Route::post('/settings', [SettingsController::class, 'update'])->name('admin.settings.update');
    Route::delete('/settings/logo', [SettingsController::class, 'deleteLogo'])->name('admin.settings.deleteLogo');

    // Email Template Management
    Route::get('/email-templates', [App\Http\Controllers\Admin\EmailTemplateController::class, 'index'])->name('admin.email-templates.index');
    Route::get('/email-templates/{id}', [App\Http\Controllers\Admin\EmailTemplateController::class, 'show'])->name('admin.email-templates.show');
    Route::put('/email-templates/{id}', [App\Http\Controllers\Admin\EmailTemplateController::class, 'update'])->name('admin.email-templates.update');
    Route::post('/email-templates/{id}/preview', [App\Http\Controllers\Admin\EmailTemplateController::class, 'preview'])->name('admin.email-templates.preview');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Project Planner Routes
    Route::get('/project/new', [ProjectPlannerController::class, 'create'])->name('project.create');
    Route::get('/project/{project}', [ProjectPlannerController::class, 'edit'])->name('project.edit');

    // Document Routes
    Route::get('/documents', [App\Http\Controllers\DocumentController::class, 'index'])->name('documents.index');
    Route::post('/documents', [App\Http\Controllers\DocumentController::class, 'store'])->name('documents.store');
    Route::get('/documents/{document}/download', [App\Http\Controllers\DocumentController::class, 'download'])->name('documents.download');
    Route::delete('/documents/{document}', [App\Http\Controllers\DocumentController::class, 'destroy'])->name('documents.destroy');
});

require __DIR__.'/auth.php';
