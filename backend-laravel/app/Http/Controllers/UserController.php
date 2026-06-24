<?php

namespace App\Http\Controllers;

use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * @param UserService $userService
     */
    public function __construct(
        private readonly UserService $userService
    ) {}

    /**
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        if (auth()->user()->role === 'SuperAdmin') {
            abort(403, 'SuperAdmin ne gère pas les collaborateurs.');
        }

        return response()->json([
            'users' => $this->userService->index(auth()->user()),
        ]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        if (auth()->user()->role === 'SuperAdmin') {
            abort(403, 'SuperAdmin ne gère pas les collaborateurs.');
        }

        $validatedData = $request->validate([
            'nom'      => 'required|string|min:2|max:50|regex:/^[a-zA-ZÀ-ÿ\s\'\-]{2,50}$/',
            'prenom'   => 'required|string|min:2|max:50|regex:/^[a-zA-ZÀ-ÿ\s\'\-]{2,50}$/',
            'email'    => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_+\-])[A-Za-z\d@$!%*?&.#^()_+\-]{8,}$/',
        ]);

        $user = $this->userService->store(auth()->user(), $validatedData);

        return response()->json([
            'message' => 'Collaborateur créé avec succès.',
            'user'    => $user->only(['id', 'nom', 'prenom', 'email', 'role', 'created_at']),
        ], 201);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        if (auth()->user()->role === 'SuperAdmin') {
            abort(403, 'SuperAdmin ne gère pas les collaborateurs.');
        }

        $this->userService->destroy(auth()->user(), $id);

        return response()->json([
            'message' => 'Utilisateur supprimé.',
        ]);
    }
}
