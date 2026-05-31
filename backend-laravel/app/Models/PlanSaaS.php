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
        'is_active',
    ];

    protected $casts = [
        'prix' => 'float',
        'credits_alloues' => 'integer',
        'is_active' => 'boolean',
    ];

    // ──────────────────────────────────────
    // Scopes
    // ──────────────────────────────────────

    /**
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // ──────────────────────────────────────
    // Relations
    // ──────────────────────────────────────

    public function abonnements(): HasMany
    {
        return $this->hasMany(Abonnement::class);
    }
}
