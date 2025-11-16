<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('email_templates')->insert([
            'key' => 'password_reset',
            'name' => 'Passwort zurücksetzen',
            'subject' => 'Passwort zurücksetzen - {{company_name}}',
            'content' => '
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6; }
        .email-container { background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
        .header { background-color: {{primary_color}}; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { background-color: #f9fafb; padding: 30px; }
        .content p { margin: 10px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: {{primary_color}}; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 15px 0; }
        .footer { background-color: {{secondary_color}}; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
        .footer p { margin: 8px 0; }
        .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Passwort zurücksetzen</h1>
        </div>
        <div class="content">
            <p>Hallo,</p>
            <p>Sie erhalten diese E-Mail, weil wir eine Anfrage zum Zurücksetzen des Passworts für Ihr Konto erhalten haben.</p>
            <p style="text-align: center;">
                <a href="{{reset_url}}" class="button">Passwort zurücksetzen</a>
            </p>
            <p>Dieser Link zum Zurücksetzen des Passworts läuft in {{expire_minutes}} Minuten ab.</p>
            <div class="warning">
                <p style="margin: 0;"><strong>⚠️ Wichtig:</strong> Falls Sie keine Passwort-Zurücksetzung angefordert haben, ignorieren Sie diese E-Mail bitte. Ihr Passwort bleibt unverändert.</p>
            </div>
            <p>Mit freundlichen Grüßen,<br>Ihr Team von {{company_name}}</p>
        </div>
        <div class="footer">
            <p><strong>{{company_name}}</strong></p>
            <p>Ihr Partner für nachhaltige Energie</p>
            <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">© 2025 {{company_name}}. Alle Rechte vorbehalten.</p>
            <p style="font-size: 12px; color: #6b7280;">Diese E-Mail wurde automatisch generiert.</p>
        </div>
    </div>
</body>
</html>',
            'variables' => json_encode(['reset_url', 'expire_minutes', 'company_name', 'primary_color', 'secondary_color']),
            'description' => 'E-Mail zum Zurücksetzen des Passworts',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('email_templates')
            ->where('key', 'password_reset')
            ->delete();
    }
};
