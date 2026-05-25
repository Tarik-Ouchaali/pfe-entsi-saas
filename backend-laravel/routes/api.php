<?php

use App\Http\Controllers\Auth\AuthController;
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

use App\Http\Controllers\CreditController;

Route::prefix('credits')->middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/balance',      [CreditController::class, 'balance']);
    Route::get('/packs',        [CreditController::class, 'packs']);
    Route::post('/purchase',    [CreditController::class, 'purchase']);
    Route::get('/transactions', [CreditController::class, 'transactions']);
});

Route::prefix('admin')->middleware(['auth:sanctum', 'superadmin'])->group(function () {
    Route::get('credit-packs',                   [CreditController::class, 'adminIndex']);
    Route::post('credit-packs',                  [CreditController::class, 'adminStore']);
    Route::put('credit-packs/{id}',              [CreditController::class, 'adminUpdate']);
    Route::delete('credit-packs/{id}',           [CreditController::class, 'adminDestroy']);
    Route::post('companies/{id}/credits/adjust', [CreditController::class, 'adjustCredits']);
});
