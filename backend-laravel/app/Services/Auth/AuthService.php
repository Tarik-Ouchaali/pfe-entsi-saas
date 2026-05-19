<?php

namespace App\Services\Auth;

use App\Models\Entreprise;
use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthService
{
    /**
     * @param array $data
     * @return array
     */
    public function register(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $entreprise = Entreprise::create([
                'raison_sociale' => $data['raison_sociale'],
                'ice' => $data['ice'],
            ]);

            $user = User::create([
                'entreprise_id' => $entreprise->id,
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'email' => $data['email'],
                'password' => bcrypt($data['password']),
                'role' => 'AdminEntreprise',
            ]);

            $user->sendEmailVerificationNotification();

            $token = $user->createToken('auth_token')->plainTextToken;

            return [
                'user' => $user->load('entreprise'),
                'token' => $token,
            ];
        });
    }

    /**
     * @param array $data
     * @return array
     *
     * @throws AuthenticationException
     */
    public function login(array $data): array
    {
        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw new AuthenticationException('Identifiants incorrects');
        }

        if (!$user->hasVerifiedEmail()) {
            abort(403, 'Email non vérifié. Vérifiez votre boîte mail.');
        }

        if ($user->entreprise && !$user->entreprise->estActive()) {
            abort(403, 'Compte entreprise désactivé.');
        }

        $user->update(['dernier_login' => now()]);

        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user->load('entreprise'),
            'token' => $token,
        ];
    }

    /**
     * @param User $user
     * @return void
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    /**
     * @param User $user
     * @return User
     */
    public function me(User $user): User
    {
        return $user->load('entreprise');
    }

    /**
     * @param string $email
     * @return void
     */
    public function forgotPassword(string $email): void
    {
        Password::broker()->sendResetLink(['email' => $email]);
    }

    /**
     * @param array $data
     * @return void
     */
    public function resetPassword(array $data): void
    {
        $status = Password::broker()->reset($data, function (User $user, string $password) {
            $user->update(['password' => bcrypt($password)]);
            $user->tokens()->delete();
        });

        if ($status !== Password::PASSWORD_RESET) {
            abort(422, 'Lien invalide ou expiré.');
        }
    }

    /**
     * @param User $user
     * @return void
     */
    public function resendVerification(User $user): void
    {
        if ($user->hasVerifiedEmail()) {
            abort(422, 'Email déjà vérifié.');
        }

        $user->sendEmailVerificationNotification();
    }

}
