<?php

namespace App\Mail;

use App\Models\ProjetDAO;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AnalyseEchoueMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * @param ProjetDAO $projet
     * @param string $raison
     */
    public function __construct(
        public ProjetDAO $projet,
        public string $raison,
    ) {
    }

    /**
     * @return Envelope
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Votre analyse DAO a échoué — {$this->projet->titre_projet}",
        );
    }

    /**
     * @return Content
     */
    public function content(): Content
    {
        return new Content(
            htmlString: "<p>Bonjour,</p><p>L'analyse pour le projet '{$this->projet->titre_projet}' a échoué.</p><p>Raison : {$this->raison}</p><p>Un crédit vous a été remboursé automatiquement.</p>",
        );
    }
}
