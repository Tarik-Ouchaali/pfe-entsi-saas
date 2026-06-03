<?php

namespace App\Console\Commands;

use App\Mail\DocumentExpirationMail;
use App\Models\DocumentBibliotheque;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class AlerteExpirationCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'bibliotheque:alertes-expiration';

    /**
     * @var string
     */
    protected $description = 'Envoie des alertes email pour les documents expirant dans 7 jours';

    /**
     * @return void
     */
    public function handle(): void
    {
        $documents = DocumentBibliotheque::with('entreprise.users')
            ->where('is_current', true)
            ->whereNotNull('date_expiration')
            ->where('date_expiration', '<=', now()->addDays(7))
            ->where('date_expiration', '>=', now())
            ->get();

        foreach ($documents as $document) {
            $admins = $document->entreprise->users()
                ->where('role', 'AdminEntreprise')
                ->get();

            foreach ($admins as $admin) {
                Mail::to($admin->email)->send(new DocumentExpirationMail($document, $admin));
            }
        }

        $this->info("{$documents->count()} document(s) traité(s).");
    }
}
