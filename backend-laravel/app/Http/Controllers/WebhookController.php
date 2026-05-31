<?php

namespace App\Http\Controllers;

use App\Models\ProjetDAO;
use App\Services\ProjetDAOService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    /**
     * @param ProjetDAOService $projetService
     */
    public function __construct(private ProjetDAOService $projetService)
    {
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function analyseDone(Request $request): JsonResponse
    {
        $data = $request->json()->all();

        $projet = ProjetDAO::findOrFail($data['projet_id']);

        if ($data['statut'] === 'success') {
            $this->projetService->marquerTermine($projet, $data['result']);
        }

        if ($data['statut'] === 'error') {
            $this->projetService->marquerEchoue($projet, $data['error']);
        }

        return response()->json(['message' => 'ok'], 200);
    }
}
