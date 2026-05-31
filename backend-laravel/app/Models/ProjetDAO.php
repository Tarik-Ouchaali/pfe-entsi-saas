<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProjetDAO extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'projet_daos';

    protected $fillable = [
        'entreprise_id',
        'user_id',
        'titre_projet',
        'description',
        'statut',
    ];

    protected $casts = [
        'statut' => 'string',
    ];

    // ──────────────────────────────────────
    // Relations
    // ──────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documentDAOs(): HasMany
    {
        return $this->hasMany(DocumentDAO::class);
    }

    public function resultatAnalyse(): HasOne
    {
        return $this->hasOne(ResultatAnalyse::class);
    }

    public function memoireTechnique(): HasOne
    {
        return $this->hasOne(MemoireTechnique::class);
    }

    // entreprise() provided by BelongsToTenant trait

    // ──────────────────────────────────────
    // Simple domain methods
    // ──────────────────────────────────────

    public function estEnCours(): bool
    {
        return $this->statut === 'En_analyse';
    }

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
