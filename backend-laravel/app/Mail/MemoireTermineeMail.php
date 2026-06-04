<?php

namespace App\Mail;

use App\Models\ProjetDAO;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MemoireTermineeMail extends Mailable implements ShouldQueue
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
            subject: "Votre mémoire technique est prêt — {$this->projet->titre_projet}",
        );
    }

    /**
     * @return Content
     */
    public function content(): Content
    {
        return new Content(
            htmlString: "<p>Bonjour,</p><p>Votre mémoire technique pour le projet '{$this->projet->titre_projet}' est prêt.</p><p>Connectez-vous pour le consulter et le télécharger.</p>",
        );
    }
}
