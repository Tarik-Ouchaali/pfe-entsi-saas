<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// ⚠️ SECURITY NOTE:
// Ce model n'a PAS de TenantScope direct.
// Toujours accéder via $projetDAO->memoireTechnique().
// ProjetDAO a TenantScope — l'accès direct à MemoireTechnique n'est pas sécurisé.

class MemoireTechnique extends Model
{
    protected $table = 'memoire_techniques';
    
    protected $fillable = [
        'projet_dao_id',
        'statut',
        'contenu',
        'chemin_export',
        'date_generation',
    ];

    protected $casts = [
        'date_generation' => 'datetime',
        'statut'          => 'string',
    ];

    // ──────────────────────────────────────
    // Relations
    // ──────────────────────────────────────

    public function projetDAO(): BelongsTo
    {
        return $this->belongsTo(ProjetDAO::class);
    }

    // ──────────────────────────────────────
    // Simple domain methods
    // ──────────────────────────────────────

    public function estGenere(): bool
    {
        return $this->chemin_export !== null;
    }

    /**
     * @return bool
     */
    public function estEnGeneration(): bool
    {
        return $this->statut === 'En_generation';
    }

    /**
     * @return bool
     */
    public function estTermine(): bool
    {
        return $this->statut === 'Termine';
    }

    /**
     * @return bool
     */
    public function estEchoue(): bool
    {
        return $this->statut === 'Echoue';
    }
}
