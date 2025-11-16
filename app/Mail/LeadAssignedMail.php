<?php

namespace App\Mail;

use App\Models\EmailTemplate;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LeadAssignedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public User $salesperson,
        public Lead $lead
    ) {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        // Get template for subject
        $template = EmailTemplate::getTemplate('lead_assigned');

        if ($template) {
            $rendered = $template->render($this->getTemplateData());
            $subject = $rendered['subject'];
        } else {
            $subject = 'Neuer Lead zugewiesen - ' . $this->lead->name;
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
        $template = EmailTemplate::getTemplate('lead_assigned');

        if ($template) {
            $rendered = $template->render($this->getTemplateData());

            return new Content(
                htmlString: $rendered['content'],
            );
        }

        // Fallback to static view
        return new Content(
            view: 'emails.lead-assigned',
        );
    }

    /**
     * Get the data array for template rendering.
     */
    private function getTemplateData(): array
    {
        return [
            'salesperson' => [
                'name' => $this->salesperson->name,
                'email' => $this->salesperson->email,
            ],
            'lead' => [
                'name' => $this->lead->name,
                'email' => $this->lead->email,
                'phone' => $this->lead->phone,
                'request_type' => $this->lead->request_type,
                'message' => $this->lead->message,
                'source' => $this->lead->source,
                'account_created' => $this->lead->account_created,
            ],
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
