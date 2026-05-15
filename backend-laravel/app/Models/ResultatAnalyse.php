<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

// ⚠️ SECURITY NOTE:
// Ce model n'a PAS de TenantScope direct.
// Toujours accéder via $projetDAO->resultatAnalyse().
// ProjetDAO a TenantScope — l'accès direct à ResultatAnalyse n'est pas sécurisé.

class ResultatAnalyse extends Model
{
    protected $table = 'resultat_analyses';
    
    protected $fillable = [
        'projet_dao_id',
        'resume_global',
        'date_analyse',
    ];

    protected $casts = [
        'date_analyse' => 'datetime',
    ];

    // ──────────────────────────────────────
    // Relations
    // ──────────────────────────────────────

    public function projetDAO(): BelongsTo
    {
        return $this->belongsTo(ProjetDAO::class);
    }

    public function exigenceDAOs(): HasMany
    {
        return $this->hasMany(ExigenceDAO::class);
    }
}
