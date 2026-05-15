<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'role',
        'entreprise_id',
        'dernier_login',
    ];

    protected $casts = [
        'dernier_login' => 'datetime',
        'role' => 'string',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // ──────────────────────────────────────
    // Relations
    // ──────────────────────────────────────

    public function entreprise(): BelongsTo
    {
        return $this->belongsTo(Entreprise::class);
    }

    public function projetDAOs(): HasMany
    {
        return $this->hasMany(ProjetDAO::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    // ──────────────────────────────────────
    // Simple domain methods
    // ──────────────────────────────────────

    public function estSuperAdmin(): bool
    {
        return $this->role === 'SuperAdmin';
    }

    public function estAdminEntreprise(): bool
    {
        return $this->role === 'AdminEntreprise';
    }
}
