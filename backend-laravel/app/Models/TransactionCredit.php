<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class TransactionCredit extends Model
{
    use BelongsToTenant;

    protected $table = 'transaction_credits';

    protected $fillable = [
        'entreprise_id',
        'type_transaction',
        'montant',
        'description',
        'date_transaction',
    ];

    protected $casts = [
        'type_transaction' => 'string',
        'montant' => 'integer',
        'date_transaction' => 'datetime',
    ];

    // entreprise() provided by BelongsToTenant trait

    // ──────────────────────────────────────
    // Simple domain methods
    // ──────────────────────────────────────

    public function estAchat(): bool
    {
        return $this->type_transaction === 'Achat';
    }

    public function estConsommation(): bool
    {
        return $this->type_transaction === 'Consommation';
    }
}
