<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Abonnement extends Model
{
    use BelongsToTenant;

    protected $table = 'abonnements';

    protected $fillable = [
        'entreprise_id',
        'plan_saas_id',
        'date_debut',
        'date_fin',
        'statut',
    ];

    protected $casts = [
        'statut' => 'string',
        'date_debut' => 'date',
        'date_fin' => 'date',
    ];

    // ──────────────────────────────────────
    // Relations
    // ──────────────────────────────────────

    public function planSaaS(): BelongsTo
    {
        return $this->belongsTo(PlanSaaS::class, 'plan_saas_id');
    }

    // entreprise() provided by BelongsToTenant trait

    // ──────────────────────────────────────
    // Simple domain methods
    // ──────────────────────────────────────

    public function estActif(): bool
    {
        return $this->statut === 'actif' && $this->date_fin >= today();
    }

    public function estExpire(): bool
    {
        return $this->date_fin < today();
    }
}
