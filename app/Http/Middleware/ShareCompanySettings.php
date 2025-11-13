<?php

namespace App\Http\Middleware;

use App\Models\CompanySetting;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ShareCompanySettings
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $settings = CompanySetting::getAllSettings();

        // Add full URL for logo if it exists
        if (isset($settings['company_logo']) && $settings['company_logo']) {
            $settings['company_logo_url'] = Storage::url($settings['company_logo']);
        }

        Inertia::share('companySettings', $settings);

        return $next($request);
    }
}
