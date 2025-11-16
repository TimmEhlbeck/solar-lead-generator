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
}
