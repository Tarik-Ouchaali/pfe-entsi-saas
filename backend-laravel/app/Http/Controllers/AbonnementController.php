<?php

namespace App\Http\Controllers;

use App\Models\Abonnement;
use App\Models\PlanSaaS;
use App\Services\AbonnementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AbonnementController extends Controller
{
    /**
     * @param AbonnementService $abonnementService
     */
    public function __construct(
        private readonly AbonnementService $abonnementService
    ) {}

    /**
     * @return JsonResponse
     */
    public function current(): JsonResponse
    {
        $entreprise = auth()->user()->entreprise;

        $abonnement = $entreprise->abonnements()
            ->where('statut', 'actif')
            ->with('planSaaS', 'nextPlan')
            ->firstOrFail();

        return response()->json([
            'plan'               => [
                'id'              => $abonnement->planSaaS->id,
                'nom_plan'        => $abonnement->planSaaS->nom_plan,
                'prix'            => $abonnement->planSaaS->prix,
                'credits_alloues' => $abonnement->planSaaS->credits_alloues,
            ],
            'abonnement'         => [
                'id'         => $abonnement->id,
                'date_debut' => $abonnement->date_debut,
                'date_fin'   => $abonnement->date_fin,
                'statut'     => $abonnement->statut,
            ],
            'next_plan'          => $abonnement->next_plan_id ? [
                'id'              => $abonnement->nextPlan->id,
                'nom_plan'        => $abonnement->nextPlan->nom_plan,
                'credits_alloues' => $abonnement->nextPlan->credits_alloues,
            ] : null,
            'abonnement_credits' => $entreprise->abonnement_credits_restants,
            'pack_credits'       => $entreprise->pack_credits_restants,
            'total_credits'      => $entreprise->totalCredits(),
        ]);
    }

    /**
     * @return JsonResponse
     */
    public function plans(): JsonResponse
    {
        return response()->json([
            'plans' => PlanSaaS::active()->get(),
        ]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function change(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required|integer|exists:plan_saas,id,is_active,1',
        ]);

        $nouveauPlan = PlanSaaS::findOrFail($request->plan_id);

        $result = $this->abonnementService->changerPlan(
            auth()->user()->entreprise,
            $nouveauPlan
        );

        return response()->json($result);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $statut = $request->input('statut', 'actif');

        $query = Abonnement::with('entreprise:id,raison_sociale', 'planSaaS:id,nom_plan,prix');

        if ($statut !== 'all') {
            $query->where('statut', $statut);
        }

        if ($statut === 'actif' && $request->boolean('expiring_soon')) {
            $query->where('date_fin', '<=', now()->addDays(7));
        }

        return response()->json($query->paginate(15));
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function adminRenouveler(int $id): JsonResponse
    {
        $abonnement = Abonnement::with('entreprise', 'planSaaS', 'nextPlan')->findOrFail($id);

        $this->abonnementService->renouvelerAbonnement($abonnement);

        return response()->json([
            'message' => 'Abonnement renouvelé avec succès.',
        ]);
    }

    /**
     * @return JsonResponse
     */
    public function adminPlansIndex(): JsonResponse
    {
        return response()->json([
            'plans' => PlanSaaS::all(),
        ]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function adminPlansStore(Request $request): JsonResponse
    {
        $request->validate([
            'nom_plan'        => 'required|string|max:255|unique:plan_saas,nom_plan',
            'prix'            => 'required|numeric|min:0',
            'credits_alloues' => 'required|integer|min:0',
            'is_active'       => 'required|boolean',
        ]);

        $plan = PlanSaaS::create($request->only([
            'nom_plan', 'prix', 'credits_alloues', 'is_active',
        ]));

        return response()->json([
            'message' => 'Plan créé avec succès.',
            'plan'    => $plan,
        ], 201);
    }

    /**
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function adminPlansUpdate(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'nom_plan'        => "sometimes|required|string|max:255|unique:plan_saas,nom_plan,{$id}",
            'prix'            => 'sometimes|required|numeric|min:0',
            'credits_alloues' => 'sometimes|required|integer|min:0',
            'is_active'       => 'sometimes|required|boolean',
        ]);

        $plan = PlanSaaS::findOrFail($id);
        $plan->update($request->only([
            'nom_plan', 'prix', 'credits_alloues', 'is_active',
        ]));

        return response()->json([
            'message' => 'Plan mis à jour.',
            'plan'    => $plan,
        ]);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function adminPlansDestroy(int $id): JsonResponse
    {
        $plan = PlanSaaS::findOrFail($id);

        $count = Abonnement::where('plan_saas_id', $id)
            ->where('statut', 'actif')
            ->count();

        if ($count > 0) {
            abort(422, "Ce plan est utilisé par {$count} abonnement(s) actif(s).");
        }

        $plan->update(['is_active' => false]);

        return response()->json([
            'message' => 'Plan désactivé. Les abonnements existants ne sont pas affectés.',
        ]);
    }
}
