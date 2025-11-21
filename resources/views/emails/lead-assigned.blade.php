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

@section('header-title', '🎯 Neuer Lead zugewiesen')

@section('content')
    <div class="content-inner">
        <p>Hallo {{ $salesperson->name }},</p>

        <p>Ihnen wurde ein neuer Lead zugewiesen. Bitte kümmern Sie sich zeitnah um die Kontaktaufnahme.</p>

        <div class="info-box">
            <h2 style="margin-top: 0; font-size: 20px;">{{ $lead->name }}</h2>

            <p style="margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <strong style="color: #6b7280;">Email:</strong><br>
                <a href="mailto:{{ $lead->email }}" style="color: inherit;">{{ $lead->email }}</a>
            </p>

            @if($lead->phone)
            <p style="margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <strong style="color: #6b7280;">Telefon:</strong><br>
                <a href="tel:{{ $lead->phone }}" style="color: inherit;">{{ $lead->phone }}</a>
            </p>
            @endif

            <p style="margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <strong style="color: #6b7280;">Anfrage-Typ:</strong><br>
                @if($lead->request_type === 'quote')
                    📄 Angebot
                @else
                    💬 Beratung
                @endif
            </p>

            @if($lead->message)
            <p style="margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <strong style="color: #6b7280;">Nachricht:</strong><br>
                {{ $lead->message }}
            </p>
            @endif

            <p style="margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <strong style="color: #6b7280;">Quelle:</strong><br>
                {{ ucfirst(str_replace('_', ' ', $lead->source)) }}
            </p>

            @if($lead->account_created)
            <p style="margin: 10px 0; padding: 8px 0;">
                <strong style="color: #6b7280;">Status:</strong><br>
                <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #dbeafe; color: #1e40af;">
                    ✓ Account erstellt
                </span>
            </p>
            @endif
        </div>

        <center>
            <a href="{{ url('/sales/leads') }}" class="button">
                Lead in CRM öffnen
            </a>
        </center>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            Bitte nehmen Sie innerhalb von 24 Stunden Kontakt mit dem Lead auf, um die Conversion-Rate zu maximieren.
        </p>
    </div>
@endsection
