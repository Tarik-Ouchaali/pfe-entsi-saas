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
        'credits_restants',
        'statut',
    ];

    protected $casts = [
        'statut' => 'string',
        'credits_restants' => 'integer',
    ];

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
    // Simple domain methods
    // ──────────────────────────────────────

    public function estActive(): bool
    {
        return $this->statut === 'active';
    }

    public function aAssezDeCredits(int $montant): bool
    {
        return $this->credits_restants >= $montant;
    }
}
