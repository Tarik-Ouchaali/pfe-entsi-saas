<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\ProjetDAO;
use App\Services\ProjetDAOService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjetDAOController extends Controller
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
    public function index(Request $request): JsonResponse
    {
        $query = ProjetDAO::with('documentDAOs:id,projet_dao_id,nom_fichier,taille');

        if ($request->has('statut')) {
            $query->where('statut', $request->query('statut'));
        }

        $projets = $query->paginate(15);

        return response()->json($projets);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'titre_projet' => 'required|string|max:255',
            'fichier'      => 'required|file|mimes:pdf|max:51200',
        ]);

        $entreprise = auth()->user()->entreprise;

        $projet = $this->projetService->store($entreprise, auth()->user(), [
            'titre_projet' => $request->titre_projet,
            'fichier'      => $request->file('fichier'),
        ]);

        $entreprise->refresh();

        return response()->json([
            'message' => 'Projet créé. Analyse en cours...',
            'projet'  => [
                'id'            => $projet->id,
                'titre_projet'  => $projet->titre_projet,
                'statut'        => $projet->statut,
            ],
            'credits' => [
                'abonnement' => $entreprise->abonnement_credits_restants,
                'pack'       => $entreprise->pack_credits_restants,
                'total'      => $entreprise->totalCredits(),
            ],
        ], 201);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $projet = ProjetDAO::with('documentDAOs', 'resultatAnalyse')->findOrFail($id);

        return response()->json($projet);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function resultats(int $id): JsonResponse
    {
        $projet = ProjetDAO::with('resultatAnalyse.exigenceDAOs')->findOrFail($id);

        if ($projet->statut !== 'Termine') {
            abort(422, 'Analyse non terminée.');
        }

        return response()->json([
            'projet'   => [
                'id'           => $projet->id,
                'titre_projet' => $projet->titre_projet,
                'statut'       => $projet->statut,
            ],
            'resultat' => [
                'resume_global' => $projet->resultatAnalyse->resume_global,
                'date_analyse'  => $projet->resultatAnalyse->date_analyse,
                'exigences'     => $projet->resultatAnalyse->exigenceDAOs,
            ],
        ]);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $projet = ProjetDAO::findOrFail($id);

        if ($projet->statut === 'En_analyse') {
            abort(422, 'Impossible de supprimer un projet en cours d\'analyse.');
        }

        AuditLog::create([
            'user_id'          => auth()->id(),
            'entreprise_id'    => auth()->user()->entreprise_id,
            'action'           => 'projet_supprime',
            'entite_concernee' => 'ProjetDAO:' . $id,
            'date_action'      => now(),
        ]);

        $projet->delete();

        return response()->json(['message' => 'Projet supprimé.']);
    }
}
