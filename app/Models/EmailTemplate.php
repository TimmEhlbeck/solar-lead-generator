<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class EmailTemplate extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'key',
        'name',
        'subject',
        'content',
        'structured_content',
        'variables',
        'description',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'variables' => 'array',
            'structured_content' => 'array',
        ];
    }

    /**
     * Get a template by its key.
     *
     * @param string $key
     * @return self|null
     */
    public static function getTemplate(string $key): ?self
    {
        return self::where('key', $key)->first();
    }

    /**
     * Render the template with the provided data.
     *
     * @param array $data
     * @return array
     */
    public function render(array $data): array
    {
        // Auto-inject company settings into data
        $data = $this->injectCompanySettings($data);

        $subject = $this->subject;
        $content = $this->content;

        // Replace all variables in subject and content
        foreach ($data as $key => $value) {
            // Support nested keys like 'lead.name'
            $this->replaceNestedVariables($subject, $key, $value);
            $this->replaceNestedVariables($content, $key, $value);
        }

        return [
            'subject' => $subject,
            'content' => $content,
        ];
    }

    /**
     * Inject company settings into the data array.
     *
     * @param array $data
     * @return array
     */
    private function injectCompanySettings(array $data): array
    {
        $settings = CompanySetting::getAllSettings();

        // Add company name
        $data['company_name'] = $settings['company_name'] ?? config('app.name');

        // Add company colors
        $data['primary_color'] = $settings['primary_color'] ?? '#0A2540';
        $data['secondary_color'] = $settings['secondary_color'] ?? '#1F2937';
        $data['accent_color'] = $settings['accent_color'] ?? '#3B82F6';

        // Add company logo URL with full path
        if (isset($settings['company_logo']) && $settings['company_logo']) {
            $data['company_logo_url'] = url(Storage::url($settings['company_logo']));
        }

        // Add app URL
        $data['app_url'] = config('app.url');

        return $data;
    }

    /**
     * Replace nested variables in the template.
     *
     * @param string &$template
     * @param string $key
     * @param mixed $value
     * @return void
     */
    private function replaceNestedVariables(string &$template, string $key, mixed $value): void
    {
        if (is_array($value) || is_object($value)) {
            foreach ($value as $subKey => $subValue) {
                $this->replaceNestedVariables($template, "{$key}.{$subKey}", $subValue);
            }
        } else {
            // Replace {{key}} with the value
            $template = str_replace("{{{$key}}}", (string) $value, $template);
        }
    }

    /**
     * Build HTML content from structured content.
     *
     * @param array $structured
     * @return string
     */
    public function buildHtmlFromStructured(array $structured): string
    {
        $settings = CompanySetting::getAllSettings();
        $primaryColor = $structured['primaryColor'] ?? ($settings['primary_color'] ?? '#EAB308');
        $secondaryColor = $structured['secondaryColor'] ?? ($settings['secondary_color'] ?? '#1F2937');

        $html = '<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6; }
        .email-container { background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
        .header { background-color: ' . $primaryColor . '; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { background-color: #f9fafb; padding: 30px; }
        .info-box { background-color: #ffffff; padding: 20px; border-left: 4px solid ' . $primaryColor . '; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; padding: 12px 24px; background-color: ' . $primaryColor . '; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 15px 0; }
        .footer { background-color: ' . $secondaryColor . '; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
        .footer p { margin: 8px 0; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>' . htmlspecialchars($structured['headerTitle'] ?? 'Willkommen') . '</h1>
        </div>
        <div class="content">';

        // Add greeting
        if (!empty($structured['greeting'])) {
            $html .= '<p>' . nl2br(htmlspecialchars($structured['greeting'])) . '</p>';
        }

        // Add main paragraphs
        if (!empty($structured['paragraphs']) && is_array($structured['paragraphs'])) {
            foreach ($structured['paragraphs'] as $paragraph) {
                if (!empty($paragraph)) {
                    $html .= '<p>' . nl2br(htmlspecialchars($paragraph)) . '</p>';
                }
            }
        }

        // Add info box if present
        if (!empty($structured['infoBoxTitle']) || !empty($structured['infoBoxContent'])) {
            $html .= '<div class="info-box">';
            if (!empty($structured['infoBoxTitle'])) {
                $html .= '<h3>' . htmlspecialchars($structured['infoBoxTitle']) . '</h3>';
            }
            if (!empty($structured['infoBoxContent'])) {
                $html .= '<p>' . nl2br(htmlspecialchars($structured['infoBoxContent'])) . '</p>';
            }
            $html .= '</div>';
        }

        // Add button if present
        if (!empty($structured['buttonText'])) {
            $buttonUrl = $structured['buttonUrl'] ?? '{{app_url}}';
            $html .= '<p style="text-align: center;">
                <a href="' . htmlspecialchars($buttonUrl) . '" class="button">' . htmlspecialchars($structured['buttonText']) . '</a>
            </p>';
        }

        // Add list if present
        if (!empty($structured['listItems']) && is_array($structured['listItems'])) {
            $html .= '<ul>';
            foreach ($structured['listItems'] as $item) {
                if (!empty($item)) {
                    $html .= '<li>' . htmlspecialchars($item) . '</li>';
                }
            }
            $html .= '</ul>';
        }

        // Add closing
        if (!empty($structured['closing'])) {
            $html .= '<p>' . nl2br(htmlspecialchars($structured['closing'])) . '</p>';
        }

        $html .= '
        </div>
        <div class="footer">
            <p><strong>{{company_name}}</strong></p>
            <p>' . htmlspecialchars($structured['footerText'] ?? 'Ihr Partner für nachhaltige Energie') . '</p>';

        if (!empty($structured['footerContact'])) {
            $html .= '<p>' . nl2br(htmlspecialchars($structured['footerContact'])) . '</p>';
        }

        $html .= '
            <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">© 2025 {{company_name}}. Alle Rechte vorbehalten.</p>
            <p style="font-size: 12px; color: #6b7280;">Diese E-Mail wurde automatisch generiert.</p>
        </div>
    </div>
</body>
</html>';

        return $html;
    }
}
