<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    public function render($request, Throwable $e): JsonResponse
    {
        // 1. Validation
        if ($e instanceof ValidationException) {
            return response()->json([
                'message' => 'Données invalides.',
                'errors'  => $e->errors(),
            ], 422);
        }

        // 2. Model not found
        if ($e instanceof ModelNotFoundException) {
            return response()->json(['message' => 'Ressource introuvable.'], 404);
        }

        // 3. Authentication
        if ($e instanceof AuthenticationException) {
            return response()->json(['message' => $e->getMessage()], 401);
        }

        // 4. Insufficient credits
        if ($e instanceof \App\Exceptions\InsufficientCreditsException) {
            return response()->json([
                'message'             => $e->getMessage(),
                'credits_manquants'   => $e->getCreditsManquants(),
                'credits_disponibles' => $e->getCreditsDisponibles(),
            ], 402);
        }

        // 5. HTTP exceptions (abort())
        if ($e instanceof HttpException) {
            return response()->json(['message' => $e->getMessage()], $e->getStatusCode());
        }

        // 5. Dev debug / Production
        if (config('app.debug')) {
            return response()->json([
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ], 500);
        }

        return response()->json(['message' => 'Erreur serveur.'], 500);
    }
    protected function unauthenticated($request, AuthenticationException $exception): JsonResponse
    {
        return response()->json(['message' => 'Non authentifié.'], 401);
    }
}