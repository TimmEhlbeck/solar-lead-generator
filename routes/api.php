<?php

use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\ProjectController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes (no authentication required)
Route::post('/leads', [LeadController::class, 'store']);

// Protected routes (require authentication)
Route::middleware(['auth'])->group(function () {
    // User info
    Route::get('/user', function (Request $request) {
        return $request->user()->load('roles');
    });

    // Projects - Full CRUD for authenticated users
    Route::apiResource('projects', ProjectController::class);

    // Leads - For salespeople and admins only
    Route::middleware('role:salesperson|admin')->group(function () {
        Route::get('/leads', [LeadController::class, 'index']);
        Route::get('/leads/{lead}', [LeadController::class, 'show']);
        Route::patch('/leads/{lead}', [LeadController::class, 'update']);
    });

    // Lead assignment - Admin only
    Route::middleware('role:admin')->group(function () {
        Route::post('/leads/{lead}/assign', [LeadController::class, 'assign']);
        Route::delete('/leads/{lead}', [LeadController::class, 'destroy']);
    });
});
