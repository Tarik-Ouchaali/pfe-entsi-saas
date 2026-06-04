<?php

namespace App\Services;

use App\Enums\TransactionType;
use App\Exceptions\InsufficientCreditsException;
use App\Jobs\MemoireJob;
use App\Mail\MemoireEchoueMail;
use App\Mail\MemoireTermineeMail;
use App\Models\AuditLog;
use App\Models\Entreprise;
use App\Models\MemoireTechnique;
use App\Models\ProjetDAO;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class MemoireService
{
    /**
     * @param CreditService $creditService
     */
    public function __construct(private CreditService $creditService)
    {
    }

    /**
     * @param ProjetDAO $projet
     * @param Entreprise $entreprise
     * @return void
     * @throws InsufficientCreditsException
     */
    public function generer(ProjetDAO $projet, Entreprise $entreprise): void
    {
        if ($projet->statut !== 'Termine') {
            abort(422, 'Analyse non terminée.');
        }

        if (!$entreprise->aAssezDeCredits(2)) {
            throw new InsufficientCreditsException(2, $entreprise->totalCredits());
        }

        $existing = MemoireTechnique::where('projet_dao_id', $projet->id)->first();

        if ($existing && $existing->statut !== 'Echoue') {
            abort(422, 'Mémoire déjà généré. Utilisez /regenerer.');
        }

        DB::transaction(function () use ($projet, $entreprise): void {
            $this->creditService->consommerCredits($entreprise, 1, TransactionType::MEMOIRE_TECHNIQUE, $projet->id);
            $this->creditService->consommerCredits($entreprise, 1, TransactionType::MEMOIRE_TECHNIQUE, $projet->id);

            MemoireTechnique::updateOrCreate(
                ['projet_dao_id' => $projet->id],
                ['statut' => 'En_generation', 'contenu' => null, 'chemin_export' => null, 'date_generation' => null]
            );

            MemoireJob::dispatch($projet);
        });
    }

    /**
     * @param ProjetDAO $projet
     * @param Entreprise $entreprise
     * @return void
     * @throws InsufficientCreditsException
     */
    public function regenerer(ProjetDAO $projet, Entreprise $entreprise): void
    {
        if ($projet->statut !== 'Termine') {
            abort(422, 'Analyse non terminée.');
        }

        if (!$entreprise->aAssezDeCredits(2)) {
            throw new InsufficientCreditsException(2, $entreprise->totalCredits());
        }

        DB::transaction(function () use ($projet, $entreprise): void {
            $this->creditService->consommerCredits($entreprise, 1, TransactionType::MEMOIRE_TECHNIQUE, $projet->id);
            $this->creditService->consommerCredits($entreprise, 1, TransactionType::MEMOIRE_TECHNIQUE, $projet->id);

            MemoireTechnique::updateOrCreate(
                ['projet_dao_id' => $projet->id],
                ['statut' => 'En_generation', 'contenu' => null, 'chemin_export' => null, 'date_generation' => null]
            );

            MemoireJob::dispatch($projet);
        });
    }

    /**
     * @param ProjetDAO $projet
     * @param array $data
     * @return void
     */
    public function sauvegarderMemoire(ProjetDAO $projet, array $data): void
    {
        DB::transaction(function () use ($projet, $data): void {
            MemoireTechnique::where('projet_dao_id', $projet->id)->update([
                'statut'          => 'Termine',
                'contenu'         => $data['contenu'],
                'chemin_export'   => $data['chemin_export'],
                'date_generation' => now(),
            ]);

            AuditLog::create([
                'user_id'          => null,
                'entreprise_id'    => $projet->entreprise_id,
                'action'           => 'memoire_genere',
                'entite_concernee' => 'ProjetDAO:' . $projet->id,
                'date_action'      => now(),
            ]);

            Mail::to($projet->user->email)->send(new MemoireTermineeMail($projet));
        });
    }

    /**
     * @param ProjetDAO $projet
     * @param string $raison
     * @return void
     */
    public function marquerEchoue(ProjetDAO $projet, string $raison): void
    {
        DB::transaction(function () use ($projet, $raison): void {
            MemoireTechnique::where('projet_dao_id', $projet->id)->update(['statut' => 'Echoue']);

            $this->creditService->rembourserCredit($projet->entreprise, $projet->id);
            $this->creditService->rembourserCredit($projet->entreprise, $projet->id);

            AuditLog::create([
                'user_id'          => null,
                'entreprise_id'    => $projet->entreprise_id,
                'action'           => 'memoire_echoue',
                'entite_concernee' => 'ProjetDAO:' . $projet->id,
                'date_action'      => now(),
            ]);

            Mail::to($projet->user->email)->send(new MemoireEchoueMail($projet, $raison));
        });
    }
}
