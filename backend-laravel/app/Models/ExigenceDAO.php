<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExigenceDAO extends Model
{
    protected $table = 'exigence_daos';
    protected $fillable = [
        'resultat_analyse_id',
        'type',
        'description',
        'est_obligatoire',
    ];

    protected $casts = [
        'type' => 'string',
        'est_obligatoire' => 'boolean',
    ];

    // ──────────────────────────────────────
    // Relations
    // ──────────────────────────────────────

    public function resultatAnalyse(): BelongsTo
    {
        return $this->belongsTo(ResultatAnalyse::class);
    }

    public function conformiteChecklists(): HasMany
    {
        return $this->hasMany(ConformiteChecklist::class);
    }
}
