<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;

class UserService
{
    /**
     * @param User $admin
     * @return Collection
     */
    public function index(User $admin): Collection
    {
        return User::where('entreprise_id', $admin->entreprise_id)
            ->where('id', '!=', $admin->id)
            ->where('role', '!=', 'SuperAdmin')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'nom', 'prenom', 'email', 'role', 'dernier_login', 'created_at']);
    }

    /**
     * @param User $admin
     * @param array $data
     * @return User
     */
    public function store(User $admin, array $data): User
    {
        $user = User::create([
            'nom'           => $data['nom'],
            'prenom'        => $data['prenom'],
            'email'         => strtolower($data['email']),
            'password'      => Hash::make($data['password']),
            'role'          => 'Collaborateur',
            'entreprise_id' => $admin->entreprise_id,
        ]);

        $user->markEmailAsVerified();

        return $user;
    }

    /**
     * @param User $admin
     * @param int $id
     * @return void
     */
    public function destroy(User $admin, int $id): void
    {
        $user = User::where('id', $id)
            ->where('entreprise_id', $admin->entreprise_id)
            ->firstOrFail();

        if ($user->role === 'SuperAdmin') {
            abort(403, 'Action non autorisée.');
        }

        $user->tokens()->delete();
        $user->delete();
    }
}
