<?php

namespace App\Services;

use App\Enums\TransactionType;
use App\Exceptions\InsufficientCreditsException;
use App\Models\CreditPack;
use App\Models\Entreprise;
use App\Models\TransactionCredit;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CreditService
{
    /**
     * @param Entreprise $entreprise
     * @param int $montant
     * @param TransactionType $type
     * @param int|null $projetId
     * @return void
     * @throws InsufficientCreditsException
     */
    public function consommerCredits(
        Entreprise $entreprise,
        int $montant,
        TransactionType $type,
        ?int $projetId = null
    ): void {
        DB::transaction(function () use ($entreprise, $montant, $type, $projetId): void {
            $entreprise = Entreprise::lockForUpdate()->findOrFail($entreprise->id);

            if ($entreprise->totalCredits() < $montant) {
                throw new InsufficientCreditsException($montant, $entreprise->totalCredits());
            }

            $entreprise->consommerCredits($montant);

            TransactionCredit::create([
                'entreprise_id'    => $entreprise->id,
                'user_id'          => Auth::id(),
                'projet_id'        => $projetId,
                'type_transaction' => $type,
                'montant'          => -$montant,
                'date_transaction' => now(),
            ]);
        });
    }

    /**
     * @param Entreprise $entreprise
     * @param CreditPack $pack
     * @return void
     */
    public function acheterPack(Entreprise $entreprise, CreditPack $pack): void
    {
        DB::transaction(function () use ($entreprise, $pack): void {
            $entreprise = Entreprise::lockForUpdate()->findOrFail($entreprise->id);

            $entreprise->ajouterCreditsPack($pack->credits);

            TransactionCredit::create([
                'entreprise_id'    => $entreprise->id,
                'user_id'          => Auth::id(),
                'type_transaction' => TransactionType::ACHAT_PACK,
                'montant'          => $pack->credits,
                'date_transaction' => now(),
            ]);
        });
    }

    /**
     * @param Entreprise $entreprise
     * @param int $montant
     * @return void
     */
    public function rechargerAbonnement(Entreprise $entreprise, int $montant): void
    {
        DB::transaction(function () use ($entreprise, $montant): void {
            $entreprise = Entreprise::lockForUpdate()->findOrFail($entreprise->id);

            $entreprise->rechargerCreditsAbonnement($montant);

            TransactionCredit::create([
                'entreprise_id'    => $entreprise->id,
                'user_id'          => Auth::id(),
                'type_transaction' => TransactionType::RECHARGE_ABONNEMENT,
                'montant'          => $montant,
                'date_transaction' => now(),
            ]);
        });
    }

    /**
     * @param Entreprise $entreprise
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getHistorique(Entreprise $entreprise, int $perPage = 15): LengthAwarePaginator
    {
        return TransactionCredit::where('entreprise_id', $entreprise->id)
            ->with('user:id,nom,prenom')
            ->orderByDesc('date_transaction')
            ->paginate($perPage);
    }
}
