<?php

namespace App\Http\Controllers;

use App\Enums\TransactionType;
use App\Models\CreditPack;
use App\Models\Entreprise;
use App\Models\TransactionCredit;
use App\Services\CreditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CreditController extends Controller
{
    /**
     * @param CreditService $creditService
     */
    public function __construct(
        private readonly CreditService $creditService
    ) {}

    /**
     * @return JsonResponse
     */
    public function balance(): JsonResponse
    {
        $entreprise = auth()->user()->entreprise;

        return response()->json([
            'abonnement_credits' => $entreprise->abonnement_credits_restants,
            'pack_credits'       => $entreprise->pack_credits_restants,
            'total'              => $entreprise->totalCredits(),
        ]);
    }

    /**
     * @return JsonResponse
     */
    public function packs(): JsonResponse
    {
        return response()->json([
            'packs' => CreditPack::active()->get(),
        ]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function purchase(Request $request): JsonResponse
    {
        $request->validate([
            'pack_id' => 'required|integer|exists:credit_packs,id,is_active,1',
        ]);

        $entreprise = auth()->user()->entreprise;
        $pack = CreditPack::findOrFail($request->pack_id);

        $this->creditService->acheterPack($entreprise, $pack);

        $entreprise->refresh();

        return response()->json([
            'message'            => 'Pack acheté avec succès.',
            'abonnement_credits' => $entreprise->abonnement_credits_restants,
            'pack_credits'       => $entreprise->pack_credits_restants,
            'total'              => $entreprise->totalCredits(),
        ]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function transactions(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 15), 50);
        $entreprise = auth()->user()->entreprise;

        return response()->json(
            $this->creditService->getHistorique($entreprise, $perPage)
        );
    }

    /**
     * @return JsonResponse
     */
    public function adminIndex(): JsonResponse
    {
        return response()->json([
            'packs' => CreditPack::all(),
        ]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function adminStore(Request $request): JsonResponse
    {
        $request->validate([
            'nom'       => 'required|string|max:255',
            'credits'   => 'required|integer|min:1',
            'prix'      => 'required|numeric|min:0',
            'is_active' => 'required|boolean',
        ]);

        $pack = CreditPack::create($request->only(['nom', 'credits', 'prix', 'is_active']));

        return response()->json([
            'message' => 'Pack créé avec succès.',
            'pack'    => $pack,
        ], 201);
    }

    /**
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function adminUpdate(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'nom'       => 'sometimes|required|string|max:255',
            'credits'   => 'sometimes|required|integer|min:1',
            'prix'      => 'sometimes|required|numeric|min:0',
            'is_active' => 'sometimes|required|boolean',
        ]);

        $pack = CreditPack::findOrFail($id);
        $pack->update($request->only(['nom', 'credits', 'prix', 'is_active']));

        return response()->json([
            'message' => 'Pack mis à jour.',
            'pack'    => $pack,
        ]);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function adminDestroy(int $id): JsonResponse
    {
        $pack = CreditPack::findOrFail($id);
        $pack->update(['is_active' => false]);

        return response()->json([
            'message' => 'Pack désactivé avec succès.',
        ]);
    }

    /**
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function adjustCredits(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'montant' => 'required|integer|not_in:0',
            'type'    => 'required|in:abonnement,pack',
            'raison'  => 'required|string|max:255',
        ]);

        $entreprise = Entreprise::withoutGlobalScopes()->findOrFail($id);

        DB::transaction(function () use ($request, $id, &$entreprise): void {
            $entreprise = Entreprise::withoutGlobalScopes()->lockForUpdate()->findOrFail($id);

            $montant = $request->integer('montant');
            $type = $request->input('type');

            if ($type === 'abonnement') {
                $current = $entreprise->abonnement_credits_restants;
                if ($current + $montant < 0) {
                    abort(422, 'Les crédits ne peuvent pas être négatifs.');
                }
                DB::table('entreprises')->where('id', $id)->increment('abonnement_credits_restants', $montant);
            } else {
                $current = $entreprise->pack_credits_restants;
                if ($current + $montant < 0) {
                    abort(422, 'Les crédits ne peuvent pas être négatifs.');
                }
                DB::table('entreprises')->where('id', $id)->increment('pack_credits_restants', $montant);
            }

            TransactionCredit::create([
                'entreprise_id'    => $id,
                'user_id'          => Auth::id(),
                'type_transaction' => TransactionType::AJUSTEMENT_MANUEL,
                'montant'          => $montant,
                'description'      => $request->input('raison'),
                'date_transaction' => now(),
            ]);
        });

        $entreprise->refresh();

        return response()->json([
            'message'            => 'Crédits ajustés avec succès.',
            'abonnement_credits' => $entreprise->abonnement_credits_restants,
            'pack_credits'       => $entreprise->pack_credits_restants,
            'total'              => $entreprise->totalCredits(),
        ]);
    }
}
