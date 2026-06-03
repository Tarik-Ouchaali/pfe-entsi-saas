<?php

namespace App\Http\Controllers;

use App\Models\DocumentBibliotheque;
use App\Services\BibliothequService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BibliothequController extends Controller
{
    /**
     * @param BibliothequService $bibliothequeService
     */
    public function __construct(
        private readonly BibliothequService $bibliothequeService
    ) {}

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $documents = DocumentBibliotheque::where('is_current', true)
            ->when($request->categorie, fn($q, $c) => $q->where('categorie', $c))
            ->orderByDesc('date_upload')
            ->paginate(15);

        return response()->json($documents);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'titre'           => 'required|string|max:255',
            'categorie'       => 'required|in:administratif,technique,cv,reference,autre',
            'fichier'         => 'required|file|mimes:pdf|max:51200',
            'date_expiration' => 'nullable|date|after:today',
        ]);

        $document = $this->bibliothequeService->upload(
            auth()->user()->entreprise,
            auth()->user(),
            [
                'titre'           => $request->titre,
                'categorie'       => $request->categorie,
                'fichier'         => $request->file('fichier'),
                'date_expiration' => $request->date_expiration,
            ]
        );

        return response()->json([
            'message'  => 'Document uploadé avec succès.',
            'document' => $document,
        ], 201);
    }

    /**
     * @param Request $request
     * @param string $groupe
     * @return JsonResponse
     */
    public function ajouterVersion(Request $request, string $groupe): JsonResponse
    {
        $request->validate([
            'fichier'         => 'required|file|mimes:pdf|max:51200',
            'titre'           => 'nullable|string|max:255',
            'categorie'       => 'nullable|in:administratif,technique,cv,reference,autre',
            'date_expiration' => 'nullable|date|after:today',
        ]);

        $document = $this->bibliothequeService->ajouterVersion(
            auth()->user()->entreprise,
            auth()->user(),
            $groupe,
            [
                'fichier'         => $request->file('fichier'),
                'titre'           => $request->titre,
                'categorie'       => $request->categorie,
                'date_expiration' => $request->date_expiration,
            ]
        );

        return response()->json([
            'message'  => 'Nouvelle version ajoutée.',
            'document' => $document,
        ], 201);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $document = DocumentBibliotheque::findOrFail($id);

        $this->bibliothequeService->supprimer($document, auth()->user());

        return response()->json([
            'message' => 'Document supprimé.',
        ]);
    }

    /**
     * @return JsonResponse
     */
    public function expirations(): JsonResponse
    {
        $documents = $this->bibliothequeService->getExpirations(auth()->user()->entreprise);

        return response()->json([
            'documents' => $documents,
            'count'     => $documents->count(),
        ]);
    }
}
