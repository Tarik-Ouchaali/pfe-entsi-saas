<?php

namespace App\Http\Controllers;

use App\Models\ConformiteChecklist;
use App\Models\ProjetDAO;
use App\Services\ConformiteService;
use Illuminate\Http\JsonResponse;

class ConformiteController extends Controller
{
    /**
     * @param ConformiteService $conformiteService
     */
    public function __construct(private ConformiteService $conformiteService)
    {
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function verifier(int $id): JsonResponse
    {
        $projet = ProjetDAO::with('resultatAnalyse.exigenceDAOs')->findOrFail($id);

        $this->conformiteService->verifier($projet);

        return response()->json([
            'message' => 'Vérification de conformité lancée.',
        ], 202);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function rapport(int $id): JsonResponse
    {
        $projet = ProjetDAO::findOrFail($id);

        $checklists = ConformiteChecklist::where('projet_dao_id', $id)
                                          ->with('exigenceDAO', 'documentBibliotheque')
                                          ->get();

        if ($checklists->isEmpty()) {
            abort(422, 'Aucune vérification effectuée.');
        }

        $scoreGlobal = $checklists->first()->score_global;
        $conformes = $checklists->where('statut', 'conforme')->count();

        return response()->json([
            'projet'       => [
                'id'            => $projet->id,
                'titre_projet'  => $projet->titre_projet,
                'statut'        => $projet->statut,
            ],
            'score_global' => $scoreGlobal,
            'resume'       => "{$conformes} exigences conformes sur {$checklists->count()}",
            'checklists'   => $checklists->map(function ($checklist) {
                return [
                    'exigence' => [
                        'type'            => $checklist->exigenceDAO->type,
                        'description'     => $checklist->exigenceDAO->description,
                        'est_obligatoire' => $checklist->exigenceDAO->est_obligatoire,
                    ],
                    'document' => $checklist->documentBibliotheque && $checklist->document_bibliotheque_id
                        ? [
                            'titre'           => $checklist->documentBibliotheque->titre,
                            'categorie'       => $checklist->documentBibliotheque->categorie,
                            'date_expiration' => $checklist->documentBibliotheque->date_expiration,
                        ]
                        : null,
                    'statut'   => $checklist->statut,
                ];
            })->values(),
        ]);
    }
}
