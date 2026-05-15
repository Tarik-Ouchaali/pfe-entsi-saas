<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// ⚠️ NOTE: Pas de TenantScope — entreprise_id nullable (SuperAdmin voit tout).
// Le filtrage par entreprise_id est géré au niveau Controller/Policy.

class AuditLog extends Model
{
    public $timestamps = false;

    protected $table = 'audit_logs';

    protected $fillable = [
        'user_id',
        'entreprise_id',
        'action',
        'entite_concernee',
        'date_action',
    ];

    protected $casts = [
        'date_action' => 'datetime',
    ];

    // ──────────────────────────────────────
    // Relations
    // ──────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withDefault();
    }

    public function entreprise(): BelongsTo
    {
        return $this->belongsTo(Entreprise::class)->withDefault();
    }
}
