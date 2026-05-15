<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token' => [
                'required',
                'string',
            ],
            'email' => [
                'required',
                'string',
                'min:5',
                'max:255',
                'regex:/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_+\-])[A-Za-z\d@$!%*?&.#^()_+\-]{8,}$/',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'token.required' => 'Le jeton de réinitialisation est obligatoire.',
            'token.string' => 'Le jeton de réinitialisation doit être une chaîne de caractères.',

            'email.required' => 'L\'adresse e-mail est obligatoire.',
            'email.string' => 'L\'adresse e-mail doit être une chaîne de caractères.',
            'email.min' => 'L\'adresse e-mail doit contenir au moins 5 caractères.',
            'email.max' => 'L\'adresse e-mail ne peut pas dépasser 255 caractères.',
            'email.regex' => 'Le format de l\'adresse e-mail est invalide.',

            'password.required' => 'Le mot de passe est obligatoire.',
            'password.string' => 'Le mot de passe doit être une chaîne de caractères.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'password.regex' => 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('email')) {
            $this->merge([
                'email' => strtolower($this->email),
            ]);
        }
    }
}
