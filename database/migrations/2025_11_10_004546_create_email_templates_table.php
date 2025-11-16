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
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // welcome_user, lead_assigned, etc.
            $table->string('name'); // Human-readable name
            $table->string('subject');
            $table->text('content'); // HTML content
            $table->text('variables')->nullable(); // JSON array of available variables
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Seed initial templates
        DB::table('email_templates')->insert([
            [
                'key' => 'welcome_user',
                'name' => 'Willkommens-E-Mail',
                'subject' => 'Willkommen bei {{company_name}} - Ihre Solar-Planung',
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
        .header-logo { max-width: 200px; max-height: 80px; margin-bottom: 15px; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { background-color: #f9fafb; padding: 30px; }
        .credentials { background-color: #ffffff; padding: 20px; border-left: 4px solid {{primary_color}}; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; padding: 12px 24px; background-color: {{primary_color}}; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 15px 0; }
        .footer { background-color: {{secondary_color}}; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
        .footer p { margin: 8px 0; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Willkommen bei {{company_name}}</h1>
        </div>
        <div class="content">
            <p>Hallo {{name}},</p>
            <p>vielen Dank für Ihr Interesse an unserer Solar-Planung! Wir haben Ihr Benutzerkonto erfolgreich erstellt.</p>
            <p>Ihr Projekt "<strong>{{project_name}}</strong>" wurde gespeichert und Sie können nun jederzeit darauf zugreifen.</p>
            <div class="credentials">
                <h3>Ihre Zugangsdaten:</h3>
                <p><strong>Email:</strong> {{email}}</p>
                <p><strong>Passwort:</strong> {{password}}</p>
                <p style="font-size: 12px; color: #666; margin-top: 15px;">⚠️ Bitte ändern Sie Ihr Passwort nach dem ersten Login aus Sicherheitsgründen.</p>
            </div>
            <p style="text-align: center;">
                <a href="{{app_url}}/login" class="button">Jetzt anmelden</a>
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
            <p>Mit freundlichen Grüßen,<br>Ihr Team von {{company_name}}</p>
        </div>
        <div class="footer">
            <p><strong>{{company_name}}</strong></p>
            <p>Ihr Partner für nachhaltige Energie</p>
            <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">© 2025 {{company_name}}. Alle Rechte vorbehalten.</p>
            <p style="font-size: 12px; color: #6b7280;">Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.</p>
        </div>
    </div>
</body>
</html>',
                'variables' => json_encode(['name', 'email', 'password', 'project_name', 'company_name', 'primary_color', 'secondary_color', 'app_url']),
                'description' => 'E-Mail die an neue Benutzer gesendet wird',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'lead_assigned',
                'name' => 'Lead zugewiesen',
                'subject' => 'Neuer Lead zugewiesen - {{lead.name}}',
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
        .lead-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid {{primary_color}}; }
        .lead-info h2 { margin-top: 0; color: {{primary_color}}; font-size: 20px; }
        .info-row { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: 600; color: #6b7280; display: inline-block; width: 120px; }
        .value { color: #111827; }
        .button { display: inline-block; background: {{primary_color}}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .footer { background-color: {{secondary_color}}; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
        .footer p { margin: 8px 0; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #dbeafe; color: #1e40af; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎯 Neuer Lead zugewiesen</h1>
        </div>
        <div class="content">
            <p>Hallo {{salesperson.name}},</p>
            <p>Ihnen wurde ein neuer Lead zugewiesen. Bitte kümmern Sie sich zeitnah um die Kontaktaufnahme.</p>
            <div class="lead-info">
                <h2>{{lead.name}}</h2>
                <div class="info-row">
                    <span class="label">Email:</span>
                    <span class="value"><a href="mailto:{{lead.email}}">{{lead.email}}</a></span>
                </div>
                <div class="info-row">
                    <span class="label">Telefon:</span>
                    <span class="value"><a href="tel:{{lead.phone}}">{{lead.phone}}</a></span>
                </div>
                <div class="info-row">
                    <span class="label">Anfrage-Typ:</span>
                    <span class="value">{{lead.request_type}}</span>
                </div>
                <div class="info-row">
                    <span class="label">Nachricht:</span>
                    <span class="value">{{lead.message}}</span>
                </div>
                <div class="info-row">
                    <span class="label">Quelle:</span>
                    <span class="value">{{lead.source}}</span>
                </div>
            </div>
            <center>
                <a href="{{app_url}}/sales/leads" class="button">Lead in CRM öffnen</a>
            </center>
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Bitte nehmen Sie innerhalb von 24 Stunden Kontakt mit dem Lead auf, um die Conversion-Rate zu maximieren.</p>
        </div>
        <div class="footer">
            <p><strong>{{company_name}}</strong></p>
            <p>© 2025 {{company_name}} - Solar Lead Generator</p>
            <p style="font-size: 12px;">Diese Email wurde automatisch generiert.</p>
        </div>
    </div>
</body>
</html>',
                'variables' => json_encode(['salesperson.name', 'salesperson.email', 'lead.name', 'lead.email', 'lead.phone', 'lead.request_type', 'lead.message', 'lead.source', 'lead.account_created', 'company_name', 'primary_color', 'secondary_color', 'app_url']),
                'description' => 'E-Mail die an Verkäufer gesendet wird wenn ein Lead zugewiesen wird',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_templates');
    }
};
