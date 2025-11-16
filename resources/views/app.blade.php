<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Favicon -->
        @php
            $faviconPath = \App\Models\CompanySetting::get('company_favicon');
            $faviconUrl = $faviconPath ? Storage::url($faviconPath) : asset('favicon.ico');
        @endphp
        <link rel="icon" type="image/x-icon" href="{{ $faviconUrl }}">
        <link rel="icon" type="image/png" sizes="32x32" href="{{ $faviconUrl }}">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ $faviconUrl }}">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ $faviconUrl }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased h-full m-0">
        @inertia
    </body>
</html>
