<?php

namespace App\Http\Controllers;

use App\Models\ProjetDAO;
use App\Services\MemoireService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MemoireController extends Controller
{
    /**
     * @param MemoireService $memoireService
     */
    public function __construct(private MemoireService $memoireService)
    {
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function generer(int $id): JsonResponse
    {
        $projet = ProjetDAO::findOrFail($id);

        $this->memoireService->generer($projet, auth()->user()->entreprise);

        return response()->json(['message' => 'Génération du mémoire en cours...'], 202);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function regenerer(int $id): JsonResponse
    {
        $projet = ProjetDAO::findOrFail($id);

        $this->memoireService->regenerer($projet, auth()->user()->entreprise);

        return response()->json(['message' => 'Régénération du mémoire en cours...'], 202);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $projet = ProjetDAO::with('memoireTechnique')->findOrFail($id);

        if (!$projet->memoireTechnique) {
            abort(422, 'Aucun mémoire généré.');
        }

        return response()->json([
            'projet'  => [
                'id'           => $projet->id,
                'titre_projet' => $projet->titre_projet,
            ],
            'memoire' => [
                'statut'          => $projet->memoireTechnique->statut,
                'contenu'         => $projet->memoireTechnique->contenu,
                'chemin_export'   => $projet->memoireTechnique->chemin_export,
                'date_generation' => $projet->memoireTechnique->date_generation,
            ],
        ]);
    }

    /**
     * @param int $id
     * @return BinaryFileResponse
     */
    public function telecharger(int $id): BinaryFileResponse
    {
        $projet = ProjetDAO::with('memoireTechnique')->findOrFail($id);

        if (!$projet->memoireTechnique || !$projet->memoireTechnique->chemin_export) {
            abort(422, 'Mémoire non disponible.');
        }

        $fullPath = '/var/shared-storage/' . $projet->memoireTechnique->chemin_export;

        if (!file_exists($fullPath)) {
            abort(404, 'Fichier introuvable.');
        }

        return response()->download($fullPath, 'memoire_' . $projet->titre_projet . '.pdf');
    }
}
