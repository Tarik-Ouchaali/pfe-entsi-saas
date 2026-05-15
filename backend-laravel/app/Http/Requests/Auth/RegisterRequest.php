<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'raison_sociale' => [
                'required',
                'string',
                'min:3',
                'max:255',
                'regex:/^[a-zA-ZÀ-ÿ0-9\s&\'.\-]{3,255}$/',
            ],
            'ice' => [
                'required',
                'string',
                'regex:/^[0-9]{15}$/',
                'unique:entreprises,ice',
            ],
            'nom' => [
                'required',
                'string',
                'min:2',
                'max:50',
                'regex:/^[a-zA-ZÀ-ÿ\s\'\-]{2,50}$/',
            ],
            'prenom' => [
                'required',
                'string',
                'min:2',
                'max:50',
                'regex:/^[a-zA-ZÀ-ÿ\s\'\-]{2,50}$/',
            ],
            'email' => [
                'required',
                'string',
                'min:5',
                'max:255',
                'regex:/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/',
                'unique:users,email',
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
            'raison_sociale.required' => 'La raison sociale est obligatoire.',
            'raison_sociale.string' => 'La raison sociale doit être une chaîne de caractères.',
            'raison_sociale.min' => 'La raison sociale doit contenir au moins 3 caractères.',
            'raison_sociale.max' => 'La raison sociale ne peut pas dépasser 255 caractères.',
            'raison_sociale.regex' => 'La raison sociale contient des caractères non autorisés.',

            'ice.required' => 'L\'ICE est obligatoire.',
            'ice.string' => 'L\'ICE doit être une chaîne de caractères.',
            'ice.regex' => 'L\'ICE doit contenir exactement 15 chiffres.',
            'ice.unique' => 'Cet ICE est déjà enregistré.',

            'nom.required' => 'Le nom est obligatoire.',
            'nom.string' => 'Le nom doit être une chaîne de caractères.',
            'nom.min' => 'Le nom doit contenir au moins 2 caractères.',
            'nom.max' => 'Le nom ne peut pas dépasser 50 caractères.',
            'nom.regex' => 'Le nom contient des caractères non autorisés.',

            'prenom.required' => 'Le prénom est obligatoire.',
            'prenom.string' => 'Le prénom doit être une chaîne de caractères.',
            'prenom.min' => 'Le prénom doit contenir au moins 2 caractères.',
            'prenom.max' => 'Le prénom ne peut pas dépasser 50 caractères.',
            'prenom.regex' => 'Le prénom contient des caractères non autorisés.',

            'email.required' => 'L\'adresse e-mail est obligatoire.',
            'email.string' => 'L\'adresse e-mail doit être une chaîne de caractères.',
            'email.min' => 'L\'adresse e-mail doit contenir au moins 5 caractères.',
            'email.max' => 'L\'adresse e-mail ne peut pas dépasser 255 caractères.',
            'email.regex' => 'Le format de l\'adresse e-mail est invalide.',
            'email.unique' => 'Cette adresse e-mail est déjà utilisée.',

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
