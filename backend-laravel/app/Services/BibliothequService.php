<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\DocumentBibliotheque;
use App\Models\Entreprise;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BibliothequService
{
    /**
     * @param Entreprise $entreprise
     * @param User $user
     * @param array $data
     * @return DocumentBibliotheque
     */
    public function upload(Entreprise $entreprise, User $user, array $data): DocumentBibliotheque
    {
        return DB::transaction(function () use ($entreprise, $user, $data): DocumentBibliotheque {
            $groupeId = (string) Str::uuid();

            $path = "bibliotheque/{$entreprise->id}/" . Str::uuid() . '.pdf';
            Storage::disk('shared')->put($path, file_get_contents($data['fichier']));

            $document = DocumentBibliotheque::create([
                'entreprise_id'      => $entreprise->id,
                'document_groupe_id' => $groupeId,
                'titre'              => $data['titre'],
                'categorie'          => $data['categorie'],
                'chemin_fichier'     => $path,
                'date_expiration'    => $data['date_expiration'] ?? null,
                'version'            => 1,
                'is_current'         => true,
                'date_upload'        => now(),
            ]);

            AuditLog::create([
                'user_id'          => $user->id,
                'entreprise_id'    => $entreprise->id,
                'action'           => 'document_uploade',
                'entite_concernee' => 'DocumentBibliotheque:' . $document->id,
                'date_action'      => now(),
            ]);

            return $document;
        });
    }

    /**
     * @param Entreprise $entreprise
     * @param User $user
     * @param string $groupeId
     * @param array $data
     * @return DocumentBibliotheque
     */
    public function ajouterVersion(Entreprise $entreprise, User $user, string $groupeId, array $data): DocumentBibliotheque
    {
        return DB::transaction(function () use ($entreprise, $user, $groupeId, $data): DocumentBibliotheque {
            $ancien = DocumentBibliotheque::where('entreprise_id', $entreprise->id)
                ->where('document_groupe_id', $groupeId)
                ->where('is_current', true)
                ->firstOrFail();

            $ancien->update(['is_current' => false]);

            $path = "bibliotheque/{$entreprise->id}/" . Str::uuid() . '.pdf';
            Storage::disk('shared')->put($path, file_get_contents($data['fichier']));

            $nouveau = DocumentBibliotheque::create([
                'entreprise_id'      => $entreprise->id,
                'document_groupe_id' => $groupeId,
                'titre'              => $data['titre'] ?? $ancien->titre,
                'categorie'          => $data['categorie'] ?? $ancien->categorie,
                'chemin_fichier'     => $path,
                'date_expiration'    => $data['date_expiration'] ?? null,
                'version'            => $ancien->version + 1,
                'is_current'         => true,
                'date_upload'        => now(),
            ]);

            AuditLog::create([
                'user_id'          => $user->id,
                'entreprise_id'    => $entreprise->id,
                'action'           => 'document_version_ajoutee',
                'entite_concernee' => 'DocumentBibliotheque:' . $nouveau->id . ' groupe:' . $groupeId,
                'date_action'      => now(),
            ]);

            return $nouveau;
        });
    }

    /**
     * @param DocumentBibliotheque $document
     * @param User $user
     * @return void
     */
    public function supprimer(DocumentBibliotheque $document, User $user): void
    {
        if (!$document->is_current) {
            abort(422, 'Impossible de supprimer une version archivée.');
        }

        DB::transaction(function () use ($document, $user): void {
            AuditLog::create([
                'user_id'          => $user->id,
                'entreprise_id'    => $document->entreprise_id,
                'action'           => 'document_supprime',
                'entite_concernee' => 'DocumentBibliotheque:' . $document->id,
                'date_action'      => now(),
            ]);

            $document->delete();
        });
    }

    /**
     * @param Entreprise $entreprise
     * @return Collection
     */
    public function getExpirations(Entreprise $entreprise): Collection
    {
        return DocumentBibliotheque::where('entreprise_id', $entreprise->id)
            ->where('is_current', true)
            ->whereNotNull('date_expiration')
            ->where('date_expiration', '<=', now()->addDays(7))
            ->where('date_expiration', '>=', now())
            ->orderBy('date_expiration')
            ->get();
    }
}
