<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Entreprise extends Model
{
    use SoftDeletes;

    protected $table = 'entreprises';

    protected $fillable = [
        'raison_sociale',
        'ice',
        'adresse',
        'abonnement_credits_restants',
        'pack_credits_restants',
        'statut',
    ];

    protected $casts = [
        'statut' => 'string',
        'abonnement_credits_restants' => 'integer',
        'pack_credits_restants' => 'integer',
    ];

    protected $hidden = ['deleted_at'];

    // ──────────────────────────────────────
    // Relations
    // ──────────────────────────────────────

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function abonnements(): HasMany
    {
        return $this->hasMany(Abonnement::class);
    }

    public function projetDAOs(): HasMany
    {
        return $this->hasMany(ProjetDAO::class);
    }

    public function documentBibliotheques(): HasMany
    {
        return $this->hasMany(DocumentBibliotheque::class);
    }

    public function transactionCredits(): HasMany
    {
        return $this->hasMany(TransactionCredit::class);
    }

    // ──────────────────────────────────────
    // Domain methods — Credits
    // ──────────────────────────────────────

    /**
     * Get the total available credits (abonnement + pack).
     */
    public function totalCredits(): int
    {
        return $this->abonnement_credits_restants + $this->pack_credits_restants;
    }

    /**
     * Check if the entreprise has enough credits for an operation.
     */
    public function aAssezDeCredits(int $montant): bool
    {
        return $this->totalCredits() >= $montant;
    }

    /**
     * Consume credits: pack credits first, then abonnement credits.
     *
     * ⚠️ Must be called inside DB::transaction() in Service layer.
     */
    public function consommerCredits(int $montant): void
    {
        $fromPack = min($montant, $this->pack_credits_restants);
        $fromAbonnement = $montant - $fromPack;

        $this->decrement('pack_credits_restants', $fromPack);

        if ($fromAbonnement > 0) {
            $this->decrement('abonnement_credits_restants', $fromAbonnement);
        }
    }

    /**
     * Reset abonnement credits on subscription renewal.
     */
    public function rechargerCreditsAbonnement(int $montant): void
    {
        $this->update(['abonnement_credits_restants' => $montant]);
    }

    /**
     * Add purchased pack credits (never expire).
     */
    public function ajouterCreditsPack(int $montant): void
    {
        $this->increment('pack_credits_restants', $montant);
    }

    // ──────────────────────────────────────
    // Simple domain methods
    // ──────────────────────────────────────

    /**
     * Check if the entreprise is active.
     */
    public function estActive(): bool
    {
        return $this->statut === 'active';
    }
}
