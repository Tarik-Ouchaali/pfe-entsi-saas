<?php

namespace App\Jobs;

use App\Models\DocumentBibliotheque;
use App\Models\MemoireTechnique;
use App\Models\ProjetDAO;
use App\Services\MemoireService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class MemoireJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;



    /**
     * @var int
     */
    public int $tries = 3;

    /**
     * @var int
     */
    public int $timeout = 300;

    /**
     * @param ProjetDAO $projet
     */
    public function __construct(public ProjetDAO $projet)
    {
    }

    /**
     * @return void
     */
    public function handle(): void
    {
        $this->projet->load(['resultatAnalyse.exigenceDAOs', 'entreprise']);

        $documents = DocumentBibliotheque::where('entreprise_id', $this->projet->entreprise_id)
                                          ->where('is_current', true)
                                          ->get();

        $payload = [
            'projet_id'     => $this->projet->id,
            'entreprise_id' => $this->projet->entreprise_id,
            'contexte'      => [
                'titre_projet'          => $this->projet->titre_projet,
                'resume_dao'            => $this->projet->resultatAnalyse->resume_global,
                'raison_sociale'        => $this->projet->entreprise->raison_sociale,
                'ice'                   => $this->projet->entreprise->ice,
                'exigences'             => $this->projet->resultatAnalyse->exigenceDAOs->map(function ($exigence) {
                    return [
                        'type'            => $exigence->type,
                        'description'     => $exigence->description,
                        'est_obligatoire' => $exigence->est_obligatoire,
                    ];
                })->values()->toArray(),
                'documents_disponibles' => $documents->map(function ($document) {
                    return [
                        'titre'          => $document->titre,
                        'categorie'      => $document->categorie,
                        'chemin_fichier' => $document->chemin_fichier,
                    ];
                })->values()->toArray(),
            ],
            'webhook_url'   => 'http://laravel/api/webhook/memoire-done',
        ];

        $response = Http::timeout(60)->post(config('services.ai_service.url') . '/memoire', $payload);

        if (!$response->successful()) {
            throw new \RuntimeException('FastAPI memoire unavailable');
        }
    }

    /**
     * @param \Throwable $e
     * @return void
     */
    public function failed(\Throwable $e): void
    {
        $memoire = MemoireTechnique::where('projet_dao_id', $this->projet->id)->first();

        if ($memoire && $memoire->statut === 'Termine') {
            return;
        }

        app(MemoireService::class)->marquerEchoue($this->projet, $e->getMessage());
    }
}
