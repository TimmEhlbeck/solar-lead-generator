<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class CompanySetting extends Model
{
    protected $fillable = ['key', 'value', 'type'];

    /**
     * Get a setting value by key
     */
    public static function get(string $key, $default = null)
    {
        return Cache::remember("setting_{$key}", 3600, function () use ($key, $default) {
            $setting = self::where('key', $key)->first();
            return $setting ? $setting->value : $default;
        });
    }

    /**
     * Set a setting value by key
     */
    public static function set(string $key, $value, string $type = 'string'): void
    {
        self::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'type' => $type]
        );
        Cache::forget("setting_{$key}");
        Cache::forget('all_settings');
    }

    /**
     * Get all settings as key-value pairs
     */
    public static function getAllSettings(): array
    {
        return Cache::remember('all_settings', 3600, function () {
            return self::query()->pluck('value', 'key')->toArray();
        });
    }

    /**
     * Clear all settings cache
     */
    public static function clearCache(): void
    {
        Cache::flush();
    }

    /**
     * Handle file uploads for settings
     */
    public static function uploadFile(string $key, $file): string
    {
        // Delete old file if exists
        $oldSetting = self::where('key', $key)->first();
        if ($oldSetting && $oldSetting->value) {
            Storage::disk('public')->delete($oldSetting->value);
        }

        // Store new file
        $path = $file->store('settings', 'public');
        self::set($key, $path, 'file');

        return $path;
    }
}
