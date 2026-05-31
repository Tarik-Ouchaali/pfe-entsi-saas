<?php

namespace App\Services;

use App\Models\Abonnement;
use App\Models\Entreprise;
use App\Models\PlanSaaS;
use Illuminate\Support\Facades\DB;

class AbonnementService
{
    /**
     * @param CreditService $creditService
     */
    public function __construct(private CreditService $creditService) {}

    /**
     * Change plan — returns array with type + message + data.
     * Controller must return this array directly as JSON response.
     *
     * @param Entreprise $entreprise
     * @param PlanSaaS $nouveauPlan
     * @return array
     */
    public function changerPlan(Entreprise $entreprise, PlanSaaS $nouveauPlan): array
    {
        return DB::transaction(function () use ($entreprise, $nouveauPlan): array {
            $abonnementActuel = $entreprise->abonnements()
                ->where('statut', 'actif')
                ->firstOrFail();

            $planActuel = $abonnementActuel->planSaaS;

            if ($planActuel->id === $nouveauPlan->id) {
                abort(422, 'Vous êtes déjà sur ce plan.');
            }

            if ($nouveauPlan->credits_alloues > $planActuel->credits_alloues) {
                $abonnementActuel->update(['statut' => 'expire']);

                Abonnement::create([
                    'entreprise_id' => $entreprise->id,
                    'plan_saas_id'  => $nouveauPlan->id,
                    'date_debut'    => now(),
                    'date_fin'      => now()->addDays(30),
                    'statut'        => 'actif',
                    'next_plan_id'  => null,
                ]);

                $this->creditService->rechargerAbonnement($entreprise, $nouveauPlan->credits_alloues);

                $entreprise->refresh();

                return [
                    'type'               => 'upgrade',
                    'message'            => "Plan mis à jour. {$nouveauPlan->credits_alloues} crédits disponibles.",
                    'abonnement_credits' => $entreprise->abonnement_credits_restants,
                    'pack_credits'       => $entreprise->pack_credits_restants,
                    'total'              => $entreprise->totalCredits(),
                ];
            }

            $abonnementActuel->update(['next_plan_id' => $nouveauPlan->id]);

            return [
                'type'     => 'downgrade',
                'message'  => "Downgrade planifié. Votre plan {$nouveauPlan->nom_plan} sera actif le {$abonnementActuel->date_fin->format('d/m/Y')}.",
                'date_fin' => $abonnementActuel->date_fin,
            ];
        });
    }

    /**
     * Renew an expired abonnement, applying pending downgrade if any.
     * Pack credits are never touched.
     *
     * @param Abonnement $abonnement
     * @return void
     */
    public function renouvelerAbonnement(Abonnement $abonnement): void
    {
        DB::transaction(function () use ($abonnement): void {
            $locked = Abonnement::lockForUpdate()->findOrFail($abonnement->id);

            $entreprise = $locked->entreprise;
            $planSuivant = $locked->next_plan_id ? $locked->nextPlan : $locked->planSaaS;

            $locked->update(['statut' => 'expire']);

            Abonnement::create([
                'entreprise_id' => $locked->entreprise_id,
                'plan_saas_id'  => $planSuivant->id,
                'date_debut'    => now(),
                'date_fin'      => now()->addDays(30),
                'statut'        => 'actif',
                'next_plan_id'  => null,
            ]);

            $this->creditService->rechargerAbonnement($entreprise, $planSuivant->credits_alloues);
        });
    }
}
