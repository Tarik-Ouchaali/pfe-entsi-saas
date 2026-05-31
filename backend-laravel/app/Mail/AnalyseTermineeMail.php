<?php

namespace App\Mail;

use App\Models\ProjetDAO;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AnalyseTermineeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * @param ProjetDAO $projet
     */
    public function __construct(public ProjetDAO $projet)
    {
    }

    /**
     * @return Envelope
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Votre analyse DAO est terminée — {$this->projet->titre_projet}",
        );
    }

    /**
     * @return Content
     */
    public function content(): Content
    {
        return new Content(
            htmlString: "<p>Bonjour,</p><p>Votre analyse pour le projet '{$this->projet->titre_projet}' est terminée.</p><p>Connectez-vous pour consulter les résultats.</p>",
        );
    }
}
