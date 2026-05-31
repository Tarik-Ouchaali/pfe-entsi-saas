<?php

namespace App\Services;

use App\Enums\TransactionType;
use App\Exceptions\InsufficientCreditsException;
use App\Jobs\AnalyseDAOJob;
use App\Mail\AnalyseEchoueMail;
use App\Mail\AnalyseTermineeMail;
use App\Models\AuditLog;
use App\Models\DocumentDAO;
use App\Models\Entreprise;
use App\Models\ExigenceDAO;
use App\Models\ProjetDAO;
use App\Models\ResultatAnalyse;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProjetDAOService
{
    /**
     * @param CreditService $creditService
     */
    public function __construct(private CreditService $creditService)
    {
    }

    /**
     * @param Entreprise $entreprise
     * @param User $user
     * @param array $data
     * @return ProjetDAO
     * @throws InsufficientCreditsException
     */
    public function store(Entreprise $entreprise, User $user, array $data): ProjetDAO
    {
        return DB::transaction(function () use ($entreprise, $user, $data): ProjetDAO {
            if (!$entreprise->aAssezDeCredits(1)) {
                throw new InsufficientCreditsException(1, $entreprise->totalCredits());
            }

            $path = "uploads/{$entreprise->id}/" . Str::uuid() . '.pdf';
            Storage::disk('shared')->put($path, file_get_contents($data['fichier']));

            $projet = ProjetDAO::create([
                'titre_projet'  => $data['titre_projet'],
                'entreprise_id' => $entreprise->id,
                'user_id'       => $user->id,
                'statut'        => 'Nouveau',
            ]);

            DocumentDAO::create([
                'projet_dao_id' => $projet->id,
                'nom_fichier'   => $data['fichier']->getClientOriginalName(),
                'chemin_fichier' => $path,
                'type_fichier'  => 'pdf',
                'taille'        => $data['fichier']->getSize(),
                'date_upload'   => now(),
            ]);

            $this->creditService->consommerCredits($entreprise, 1, TransactionType::ANALYSE_DAO, $projet->id);

            $projet->update(['statut' => 'En_analyse']);

            AuditLog::create([
                'user_id'          => $user->id,
                'entreprise_id'    => $entreprise->id,
                'action'           => 'analyse_lancee',
                'entite_concernee' => 'ProjetDAO:' . $projet->id,
                'date_action'      => now(),
            ]);

            AnalyseDAOJob::dispatch($projet);

            return $projet->fresh();
        });
    }

    /**
     * @param ProjetDAO $projet
     * @param array $resultats
     * @return void
     */
    public function marquerTermine(ProjetDAO $projet, array $resultats): void
    {
        DB::transaction(function () use ($projet, $resultats): void {
            $resultat = ResultatAnalyse::create([
                'projet_dao_id' => $projet->id,
                'resume_global' => $resultats['resume_global'],
                'date_analyse'  => now(),
            ]);

            foreach ($resultats['exigences'] as $exigence) {
                ExigenceDAO::create([
                    'resultat_analyse_id' => $resultat->id,
                    'type'                => $exigence['type'],
                    'description'         => $exigence['description'],
                    'est_obligatoire'     => $exigence['est_obligatoire'],
                ]);
            }

            $projet->update(['statut' => 'Termine']);

            AuditLog::create([
                'user_id'          => null,
                'entreprise_id'    => $projet->entreprise_id,
                'action'           => 'analyse_terminee',
                'entite_concernee' => 'ProjetDAO:' . $projet->id,
                'date_action'      => now(),
            ]);

            Mail::to($projet->user->email)->send(new AnalyseTermineeMail($projet));
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
            $projet->update(['statut' => 'Echoue']);

            $this->creditService->rembourserCredit($projet->entreprise, $projet->id);

            AuditLog::create([
                'user_id'          => null,
                'entreprise_id'    => $projet->entreprise_id,
                'action'           => 'analyse_echouee',
                'entite_concernee' => 'ProjetDAO:' . $projet->id,
                'date_action'      => now(),
            ]);

            Mail::to($projet->user->email)->send(new AnalyseEchoueMail($projet, $raison));
        });
    }
}
