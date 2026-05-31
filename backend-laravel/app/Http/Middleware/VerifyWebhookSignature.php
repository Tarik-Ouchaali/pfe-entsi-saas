<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyWebhookSignature
{
    /**
     * @param Request $request
     * @param Closure $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $payload = $request->getContent();
        $signature = $request->header('X-Webhook-Signature');

        if (!$signature) {
            abort(401, 'Signature manquante.');
        }

        $expected = hash_hmac('sha256', $payload, config('services.webhook.secret'));

        if (!hash_equals($expected, $signature)) {
            abort(401, 'Signature invalide.');
        }

        return $next($request);
    }
}
