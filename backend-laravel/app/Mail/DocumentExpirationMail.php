<?php

namespace App\Mail;

use App\Models\DocumentBibliotheque;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DocumentExpirationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * @param DocumentBibliotheque $document
     * @param User $admin
     */
    public function __construct(
        public DocumentBibliotheque $document,
        public User $admin
    ) {}

    /**
     * @return Envelope
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Document expirant bientôt — {$this->document->titre}",
        );
    }

    /**
     * @return Content
     */
    public function content(): Content
    {
        return new Content(
            htmlString: "<p>Bonjour {$this->admin->prenom},</p>"
                . "<p>Le document '{$this->document->titre}' (catégorie: {$this->document->categorie}) "
                . "expire le {$this->document->date_expiration->format('d/m/Y')}.</p>"
                . "<p>Pensez à le renouveler avant expiration.</p>",
        );
    }
}
