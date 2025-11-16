<?php

namespace App\Notifications;

use App\Models\EmailTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $resetUrl = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        $expireMinutes = config('auth.passwords.' . config('auth.defaults.passwords') . '.expire');

        // Get template from database
        $template = EmailTemplate::getTemplate('password_reset');

        if ($template) {
            $rendered = $template->render([
                'reset_url' => $resetUrl,
                'expire_minutes' => $expireMinutes,
            ]);

            return (new MailMessage)
                ->subject($rendered['subject'])
                ->html($rendered['content']);
        }

        // Fallback to Laravel's default
        return (new MailMessage)
            ->subject('Passwort zurücksetzen')
            ->line('Sie erhalten diese E-Mail, weil wir eine Anfrage zum Zurücksetzen des Passworts für Ihr Konto erhalten haben.')
            ->action('Passwort zurücksetzen', $resetUrl)
            ->line('Dieser Link zum Zurücksetzen des Passworts läuft in ' . $expireMinutes . ' Minuten ab.')
            ->line('Falls Sie keine Passwort-Zurücksetzung angefordert haben, ignorieren Sie diese E-Mail bitte.');
    }
}
