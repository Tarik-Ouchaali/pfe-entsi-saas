<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\ProjetDAO;
use App\Services\ConformiteService;
use App\Services\MemoireService;
use App\Services\ProjetDAOService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    /**
     * @param ProjetDAOService $projetService
     * @param ConformiteService $conformiteService
     * @param MemoireService $memoireService
     */
    public function __construct(
        private ProjetDAOService $projetService,
        private ConformiteService $conformiteService,
        private MemoireService $memoireService,
    ) {
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

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function conformiteDone(Request $request): JsonResponse
    {
        $data = $request->json()->all();

        $projet = ProjetDAO::findOrFail($data['projet_id']);

        if ($data['statut'] === 'success') {
            $this->conformiteService->sauvegarderResultats($projet, $data);
        }

        if ($data['statut'] === 'error') {
            AuditLog::create([
                'user_id'          => null,
                'entreprise_id'    => $projet->entreprise_id,
                'action'           => 'conformite_echouee_webhook',
                'entite_concernee' => 'ProjetDAO:' . $projet->id,
                'date_action'      => now(),
            ]);
        }

        return response()->json(['message' => 'ok'], 200);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function memoireDone(Request $request): JsonResponse
    {
        $data = $request->json()->all();

        $projet = ProjetDAO::findOrFail($data['projet_id']);

        if ($data['statut'] === 'success') {
            $this->memoireService->sauvegarderMemoire($projet, $data);
        }

        if ($data['statut'] === 'error') {
            $this->memoireService->marquerEchoue($projet, $data['error']);
        }

        return response()->json(['message' => 'ok'], 200);
    }
}
