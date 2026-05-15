<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DocumentBibliotheque extends Model
{
    use BelongsToTenant, SoftDeletes;

    const STORAGE_PATH = '/var/shared-storage';

    protected $table = 'document_bibliotheques';

    protected $fillable = [
        'entreprise_id',
        'document_groupe_id',
        'titre',
        'categorie',
        'chemin_fichier',
        'date_expiration',
        'version',
        'is_current',
        'date_upload',
    ];

    protected $casts = [
        'date_expiration' => 'date',
        'version' => 'integer',
        'is_current' => 'boolean',
        'date_upload' => 'datetime',
    ];

    // ──────────────────────────────────────
    // Relations
    // ──────────────────────────────────────

    public function conformiteChecklists(): HasMany
    {
        return $this->hasMany(ConformiteChecklist::class);
    }

    // entreprise() provided by BelongsToTenant trait

    // ──────────────────────────────────────
    // Simple domain methods
    // ──────────────────────────────────────

    public function getFullPath(): string
    {
        return self::STORAGE_PATH . '/' . $this->chemin_fichier;
    }

    public function estExpire(): bool
    {
        return $this->date_expiration && $this->date_expiration < today();
    }

    public function estCourant(): bool
    {
        return $this->is_current === true;
    }
}
