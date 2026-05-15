<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (!auth()->check()) {
            return;
        }

        /** @var \App\Models\User $user */

        $user = auth()->user();

        if ($user->role === 'SuperAdmin' || $user->entreprise_id === null) {
            return;
        }

        $builder->where('entreprise_id', $user->entreprise_id);
    }
}
