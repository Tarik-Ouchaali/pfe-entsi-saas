<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
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
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'L\'adresse e-mail est obligatoire.',
            'email.string' => 'L\'adresse e-mail doit être une chaîne de caractères.',
            'email.min' => 'L\'adresse e-mail doit contenir au moins 5 caractères.',
            'email.max' => 'L\'adresse e-mail ne peut pas dépasser 255 caractères.',
            'email.regex' => 'Le format de l\'adresse e-mail est invalide.',

            'password.required' => 'Le mot de passe est obligatoire.',
            'password.string' => 'Le mot de passe doit être une chaîne de caractères.',
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
