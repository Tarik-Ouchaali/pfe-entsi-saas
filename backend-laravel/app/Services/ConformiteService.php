<?php

namespace App\Services;

use App\Jobs\ConformiteJob;
use App\Mail\ConformiteTermineeMail;
use App\Models\AuditLog;
use App\Models\ConformiteChecklist;
use App\Models\ProjetDAO;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class ConformiteService
{
    /**
     * @param ProjetDAO $projet
     * @return void
     */
    public function verifier(ProjetDAO $projet): void
    {
        if ($projet->statut !== 'Termine') {
            abort(422, 'Analyse non terminée.');
        }

        $projet->load('resultatAnalyse.exigenceDAOs');

        if ($projet->resultatAnalyse->exigenceDAOs->isEmpty()) {
            abort(422, 'Aucune exigence extraite.');
        }

        ConformiteJob::dispatch($projet);
    }

    /**
     * @param ProjetDAO $projet
     * @param array $data
     * @return void
     */
    public function sauvegarderResultats(ProjetDAO $projet, array $data): void
    {
        DB::transaction(function () use ($projet, $data) {
            foreach ($data['matchings'] as $matching) {
                ConformiteChecklist::updateOrCreate(
                    [
                        'projet_dao_id'   => $projet->id,
                        'exigence_dao_id' => $matching['exigence_id'],
                    ],
                    [
                        'document_bibliotheque_id' => $matching['document_id'] ?? null,
                        'statut'                   => $matching['statut'],
                        'date_verification'        => now(),
                        'score_global'             => $data['score_global'],
                    ]
                );
            }

            AuditLog::create([
                'user_id'          => null,
                'entreprise_id'    => $projet->entreprise_id,
                'action'           => 'conformite_verifiee',
                'entite_concernee' => 'ProjetDAO:' . $projet->id,
                'date_action'      => now(),
            ]);
        });

        Mail::to($projet->user->email)
             ->send(new ConformiteTermineeMail($projet, $data['score_global']));
    }
}
