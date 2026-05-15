<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConformiteChecklist extends Model
{
    protected $table = 'conformite_checklists';
    protected $fillable = [
        'exigence_dao_id',
        'document_bibliotheque_id',
        'statut',
        'date_verification',
        'score_global',
    ];

    protected $casts = [
        'statut' => 'string',
        'date_verification' => 'datetime',
        'score_global' => 'float',
    ];

    // ──────────────────────────────────────
    // TenantScope via whereHas
    // ──────────────────────────────────────

    protected static function booted(): void
    {
        static::addGlobalScope('tenant_conformite', function (Builder $query) {
            if (auth()->check()
                && auth()->user()->role !== 'SuperAdmin'
                && auth()->user()->entreprise_id) {
                $query->whereHas('exigenceDAO.resultatAnalyse.projetDAO', function (Builder $q) {
                    $q->where('entreprise_id', auth()->user()->entreprise_id);
                });
            }
        });
    }

    // ──────────────────────────────────────
    // Relations
    // ──────────────────────────────────────

    public function exigenceDAO(): BelongsTo
    {
        return $this->belongsTo(ExigenceDAO::class);
    }

    public function documentBibliotheque(): BelongsTo
    {
        return $this->belongsTo(DocumentBibliotheque::class)->withDefault();
    }

    // ──────────────────────────────────────
    // Simple domain methods
    // ──────────────────────────────────────

    public function estConforme(): bool
    {
        return $this->statut === 'conforme';
    }

    public function aUnDocument(): bool
    {
        return $this->document_bibliotheque_id !== null;
    }
}
