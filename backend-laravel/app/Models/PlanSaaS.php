<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlanSaaS extends Model
{
    protected $table = 'plan_saas';

    protected $fillable = [
        'nom_plan',
        'prix',
        'credits_alloues',
        'description',
    ];

    protected $casts = [
        'prix' => 'float',
        'credits_alloues' => 'integer',
    ];

    // ──────────────────────────────────────
    // Relations
    // ──────────────────────────────────────

    public function abonnements(): HasMany
    {
        return $this->hasMany(Abonnement::class);
    }
}
