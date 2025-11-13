<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
