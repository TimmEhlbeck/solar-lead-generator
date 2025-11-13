<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neuer Lead zugewiesen</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #0A2540 0%, #1e5a8e 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .lead-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #0A2540;
        }
        .lead-info h2 {
            margin-top: 0;
            color: #0A2540;
            font-size: 20px;
        }
        .info-row {
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: 600;
            color: #6b7280;
            display: inline-block;
            width: 120px;
        }
        .value {
            color: #111827;
        }
        .button {
            display: inline-block;
            background: #0A2540;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
        }
        .button:hover {
            background: #1e5a8e;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            background: #dbeafe;
            color: #1e40af;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Neuer Lead zugewiesen</h1>
    </div>

    <div class="content">
        <p>Hallo {{ $salesperson->name }},</p>

        <p>Ihnen wurde ein neuer Lead zugewiesen. Bitte kümmern Sie sich zeitnah um die Kontaktaufnahme.</p>

        <div class="lead-info">
            <h2>{{ $lead->name }}</h2>

            <div class="info-row">
                <span class="label">Email:</span>
                <span class="value"><a href="mailto:{{ $lead->email }}">{{ $lead->email }}</a></span>
            </div>

            @if($lead->phone)
            <div class="info-row">
                <span class="label">Telefon:</span>
                <span class="value"><a href="tel:{{ $lead->phone }}">{{ $lead->phone }}</a></span>
            </div>
            @endif

            <div class="info-row">
                <span class="label">Anfrage-Typ:</span>
                <span class="value">
                    @if($lead->request_type === 'quote')
                        📄 Angebot
                    @else
                        💬 Beratung
                    @endif
                </span>
            </div>

            @if($lead->message)
            <div class="info-row">
                <span class="label">Nachricht:</span>
                <span class="value">{{ $lead->message }}</span>
            </div>
            @endif

            <div class="info-row">
                <span class="label">Quelle:</span>
                <span class="value">{{ ucfirst(str_replace('_', ' ', $lead->source)) }}</span>
            </div>

            @if($lead->account_created)
            <div class="info-row">
                <span class="label">Status:</span>
                <span class="badge">✓ Account erstellt</span>
            </div>
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

    <div class="footer">
        <p>© {{ date('Y') }} GW Energytec - Solar Lead Generator</p>
        <p>Diese Email wurde automatisch generiert.</p>
    </div>
</body>
</html>
