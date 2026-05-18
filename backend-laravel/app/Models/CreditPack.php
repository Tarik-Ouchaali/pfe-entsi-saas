<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreditPack extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'credit_packs';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'nom',
        'credits',
        'prix',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'prix' => 'float',
        'credits' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Scope a query to only include active credit packs.
     */
    public function scopeActive(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('is_active', true);
    }
}
