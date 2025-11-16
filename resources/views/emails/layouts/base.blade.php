<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? config('app.name') }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f3f4f6;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: {{ $primaryColor ?? '#0A2540' }};
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header-logo {
            max-width: 200px;
            max-height: 80px;
            margin-bottom: 15px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            background-color: #f9fafb;
            padding: 30px;
        }
        .content-inner {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 6px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: {{ $primaryColor ?? '#0A2540' }};
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 15px 0;
        }
        .button:hover {
            opacity: 0.9;
        }
        .info-box {
            background-color: #ffffff;
            padding: 20px;
            border-left: 4px solid {{ $primaryColor ?? '#0A2540' }};
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            background-color: {{ $secondaryColor ?? '#1F2937' }};
            color: #9ca3af;
            padding: 30px;
            text-align: center;
            font-size: 14px;
        }
        .footer-logo {
            max-width: 150px;
            max-height: 60px;
            margin-bottom: 15px;
            opacity: 0.8;
        }
        .footer p {
            margin: 8px 0;
        }
        .footer-links {
            margin: 15px 0;
        }
        .footer-links a {
            color: #9ca3af;
            text-decoration: none;
            margin: 0 10px;
        }
        .footer-links a:hover {
            color: #ffffff;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            @if(isset($companyLogoUrl) && $companyLogoUrl)
                <img src="{{ $companyLogoUrl }}" alt="{{ $companyName ?? config('app.name') }}" class="header-logo">
            @endif
            <h1>@yield('header-title', $companyName ?? config('app.name'))</h1>
        </div>

        <!-- Content -->
        <div class="content">
            @yield('content')
        </div>

        <!-- Footer -->
        <div class="footer">
            @if(isset($companyLogoUrl) && $companyLogoUrl)
                <img src="{{ $companyLogoUrl }}" alt="{{ $companyName ?? config('app.name') }}" class="footer-logo">
            @endif
            <p><strong>{{ $companyName ?? config('app.name') }}</strong></p>
            <p>Ihr Partner für nachhaltige Energie</p>

            @if(isset($footerText) && $footerText)
                <p style="margin-top: 15px;">{{ $footerText }}</p>
            @endif

            <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">
                © {{ date('Y') }} {{ $companyName ?? config('app.name') }}. Alle Rechte vorbehalten.
            </p>
            <p style="font-size: 12px; color: #6b7280;">
                Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.
            </p>
        </div>
    </div>
</body>
</html>
