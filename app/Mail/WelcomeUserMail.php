<?php

namespace App\Mail;

use App\Models\EmailTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeUserMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public string $projectName,
    ) {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        // Get template for subject
        $template = EmailTemplate::getTemplate('welcome_user');

        if ($template) {
            $rendered = $template->render($this->getTemplateData());
            $subject = $rendered['subject'];
        } else {
            $subject = 'Willkommen - Ihre Solar-Planung';
        }

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        // Get template from database
        $template = EmailTemplate::getTemplate('welcome_user');

        if ($template) {
            $rendered = $template->render($this->getTemplateData());

            return new Content(
                htmlString: $rendered['content'],
            );
        }

        // Fallback to static view
        return new Content(
            view: 'emails.welcome-user',
        );
    }

    /**
     * Get the data array for template rendering.
     */
    private function getTemplateData(): array
    {
        return [
            'name' => $this->name,
            'email' => $this->email,
            'password' => $this->password,
            'project_name' => $this->projectName,
        ];
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
