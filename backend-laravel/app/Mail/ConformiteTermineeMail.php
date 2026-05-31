<?php

namespace App\Mail;

use App\Models\ProjetDAO;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ConformiteTermineeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * @param ProjetDAO $projet
     * @param float $scoreGlobal
     */
    public function __construct(
        public ProjetDAO $projet,
        public float $scoreGlobal,
    ) {
    }

    /**
     * @return Envelope
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Votre rapport de conformité est prêt — {$this->projet->titre_projet}",
        );
    }

    /**
     * @return Content
     */
    public function content(): Content
    {
        return new Content(
            htmlString: "<p>Bonjour, votre vérification de conformité pour le projet '{$this->projet->titre_projet}' est terminée.</p><p>Score global: {$this->scoreGlobal}%</p><p>Connectez-vous pour consulter le rapport détaillé.</p>",
        );
    }
}
