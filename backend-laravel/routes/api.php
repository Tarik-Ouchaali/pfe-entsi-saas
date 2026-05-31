<?php

use App\Http\Controllers\AbonnementController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CreditController;
use App\Http\Controllers\ProjetDAOController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;


    Route::prefix('auth')->group(function () {

        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1');
        Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');

        Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
            ->middleware(['signed'])
            ->name('verification.verify');

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/email/resend', [AuthController::class, 'resendVerification'])->middleware('throttle:6,1');
        });

    });

// ── Entreprise (email verification required) ────────────────
Route::middleware(['auth:sanctum', 'verified'])->group(function () {

    Route::prefix('credits')->group(function () {
        Route::get('/balance',      [CreditController::class, 'balance']);
        Route::get('/packs',        [CreditController::class, 'packs']);
        Route::post('/purchase',    [CreditController::class, 'purchase']);
        Route::get('/transactions', [CreditController::class, 'transactions']);
    });

    Route::prefix('abonnement')->group(function () {
        Route::get('/current', [AbonnementController::class, 'current']);
        Route::get('/plans',   [AbonnementController::class, 'plans']);
        Route::post('/change', [AbonnementController::class, 'change']);
    });

    Route::prefix('projets')->group(function () {
        Route::get('/',               [ProjetDAOController::class, 'index']);
        Route::post('/',              [ProjetDAOController::class, 'store']);
        Route::get('/{id}',           [ProjetDAOController::class, 'show']);
        Route::get('/{id}/resultats', [ProjetDAOController::class, 'resultats']);
        Route::delete('/{id}',        [ProjetDAOController::class, 'destroy']);
    });
});

// Webhook — FastAPI → Laravel (no sanctum — HMAC protected)
Route::post('/webhook/analysis-done', [WebhookController::class, 'analyseDone'])
     ->middleware('verify.webhook');

// ── SuperAdmin ──────────────────────────────────────────────
Route::prefix('admin')->middleware(['auth:sanctum', 'superadmin'])->group(function () {

    // Credit packs
    Route::get('credit-packs',                   [CreditController::class, 'adminIndex']);
    Route::post('credit-packs',                  [CreditController::class, 'adminStore']);
    Route::put('credit-packs/{id}',              [CreditController::class, 'adminUpdate']);
    Route::delete('credit-packs/{id}',           [CreditController::class, 'adminDestroy']);
    Route::post('companies/{id}/credits/adjust', [CreditController::class, 'adjustCredits']);

    // Plans SaaS
    Route::get('plans',          [AbonnementController::class, 'adminPlansIndex']);
    Route::post('plans',         [AbonnementController::class, 'adminPlansStore']);
    Route::put('plans/{id}',     [AbonnementController::class, 'adminPlansUpdate']);
    Route::delete('plans/{id}',  [AbonnementController::class, 'adminPlansDestroy']);

    // Abonnements
    Route::get('abonnements',                  [AbonnementController::class, 'adminIndex']);
    Route::post('abonnements/{id}/renouveler', [AbonnementController::class, 'adminRenouveler']);
});
