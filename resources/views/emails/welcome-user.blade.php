<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Willkommen bei GW Energytec</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #0A2540;
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 30px 20px;
            border-radius: 0 0 8px 8px;
        }
        .credentials {
            background-color: #fff;
            padding: 20px;
            border-left: 4px solid #0A2540;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #0A2540;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Willkommen bei GW Energytec</h1>
    </div>

    <div class="content">
        <p>Hallo {{ $name }},</p>

        <p>vielen Dank für Ihr Interesse an unserer Solar-Planung! Wir haben Ihr Benutzerkonto erfolgreich erstellt.</p>

        <p>Ihr Projekt "<strong>{{ $projectName }}</strong>" wurde gespeichert und Sie können nun jederzeit darauf zugreifen.</p>

        <div class="credentials">
            <h3>Ihre Zugangsdaten:</h3>
            <p><strong>Email:</strong> {{ $email }}</p>
            <p><strong>Passwort:</strong> {{ $password }}</p>
            <p style="font-size: 12px; color: #666; margin-top: 15px;">
                ⚠️ Bitte ändern Sie Ihr Passwort nach dem ersten Login aus Sicherheitsgründen.
            </p>
        </div>

        <p>
            <a href="{{ url('/login') }}" class="button">Jetzt anmelden</a>
        </p>

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
        Ihr Team von GW Energytec</p>
    </div>

    <div class="footer">
        <p>GW Energytec - Ihr Partner für nachhaltige Energie</p>
        <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.</p>
    </div>
</body>
</html>
