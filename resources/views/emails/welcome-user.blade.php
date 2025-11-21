@php
    $settings = \App\Models\CompanySetting::getAllSettings();
    $primaryColor = $settings['primary_color'] ?? '#EAB308';
    $companyName = $settings['company_name'] ?? 'GW Energytec';
    $companyLogoUrl = isset($settings['company_logo']) ? \Storage::url($settings['company_logo']) : null;
@endphp

@extends('emails.layouts.base', [
    'primaryColor' => $primaryColor,
    'companyName' => $companyName,
    'companyLogoUrl' => $companyLogoUrl,
])

@section('header-title', 'Willkommen!')

@section('content')
    <div class="content-inner">
        <p>Hallo {{ $name }},</p>

        <p>vielen Dank für Ihr Interesse an unserer Solar-Planung! Wir haben Ihr Benutzerkonto erfolgreich erstellt.</p>

        <p>Ihr Projekt "<strong>{{ $projectName }}</strong>" wurde gespeichert und Sie können nun jederzeit darauf zugreifen.</p>

        <div class="info-box">
            <h3 style="margin-top: 0;">Ihre Zugangsdaten:</h3>
            <p><strong>Email:</strong> {{ $email }}</p>
            <p><strong>Passwort:</strong> {{ $password }}</p>
            <p style="font-size: 12px; color: #666; margin-top: 15px;">
                ⚠️ Bitte ändern Sie Ihr Passwort nach dem ersten Login aus Sicherheitsgründen.
            </p>
        </div>

        <center>
            <a href="{{ url('/login') }}" class="button">Jetzt anmelden</a>
        </center>

        <p>Nach dem Login können Sie:</p>
        <ul>
            <li>Ihre Solar-Planung einsehen und bearbeiten</li>
            <li>Weitere Projekte erstellen</li>
            <li>Ihre Dokumente verwalten</li>
            <li>Mit unserem Team in Kontakt treten</li>
        </ul>

        <p>Wir melden uns in Kürze bei Ihnen, um die nächsten Schritte zu besprechen.</p>

        <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>

        <p>Mit freundlichen Grüßen,<br>
        Ihr Team von {{ $companyName }}</p>
    </div>
@endsection
