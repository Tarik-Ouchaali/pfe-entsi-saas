<?php

namespace App\Traits;

use App\Models\Entreprise;
use App\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope());

        static::creating(function ($model) {
            if (auth()->check() && !$model->entreprise_id) {
                $model->entreprise_id = auth()->user()->entreprise_id;
            }
        });
    }

    public function entreprise(): BelongsTo
    {
        return $this->belongsTo(Entreprise::class);
    }
}
