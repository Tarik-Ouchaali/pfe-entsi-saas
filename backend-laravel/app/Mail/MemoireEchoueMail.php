<?php

namespace App\Mail;

use App\Models\ProjetDAO;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MemoireEchoueMail extends Mailable implements ShouldQueue
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
            subject: "Génération du mémoire technique échouée — {$this->projet->titre_projet}",
        );
    }

    /**
     * @return Content
     */
    public function content(): Content
    {
        return new Content(
            htmlString: "<p>Bonjour,</p><p>La génération du mémoire pour le projet '{$this->projet->titre_projet}' a échoué.</p><p>Raison : {$this->raison}</p><p>2 crédits vous ont été remboursés automatiquement.</p>",
        );
    }
}
