<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// ⚠️ SECURITY NOTE:
// Ce model n'a PAS de TenantScope direct.
// Toujours accéder via $projet->documentDAOs().
// ProjetDAO a TenantScope — l'accès direct à DocumentDAO n'est pas sécurisé.

class DocumentDAO extends Model
{
    const STORAGE_PATH = '/var/shared-storage';

    protected $table = 'document_daos';

    protected $fillable = [
        'projet_dao_id',
        'nom_fichier',
        'chemin_fichier',
        'type_fichier',
        'taille',
        'date_upload',
    ];

    protected $casts = [
        'taille' => 'integer',
        'date_upload' => 'datetime',
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

    public function getFullPath(): string
    {
        return self::STORAGE_PATH . '/' . $this->chemin_fichier;
    }
}
