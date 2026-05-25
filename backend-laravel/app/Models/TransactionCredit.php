<?php

namespace App\Models;

use App\Enums\TransactionType;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionCredit extends Model
{
    use BelongsToTenant;

    protected $table = 'transaction_credits';

    protected $fillable = [
        'entreprise_id',
        'user_id',
        'projet_id',
        'type_transaction',
        'montant',
        'description',
        'date_transaction',
    ];

    protected $casts = [
        'type_transaction' => TransactionType::class,
        'montant' => 'integer',
        'date_transaction' => 'datetime',
    ];

    // entreprise() provided by BelongsToTenant trait

    /**
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withDefault();
    }

    /**
     * @return BelongsTo
     */
    public function projet(): BelongsTo
    {
        return $this->belongsTo(ProjetDAO::class)->withDefault();
    }

    /**
     * @return bool
     */
    public function estCredit(): bool
    {
        return $this->type_transaction->isCredit() && $this->montant > 0;
    }

    /**
     * @return bool
     */
    public function estConsommation(): bool
    {
        return !$this->type_transaction->isCredit() || $this->montant < 0;
    }
}
