<?php

namespace App\Jobs;

use App\Models\AuditLog;
use App\Models\DocumentBibliotheque;
use App\Models\ProjetDAO;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class ConformiteJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @var string
     */
    public string $queue = 'default';

    /**
     * @var int
     */
    public int $tries = 3;

    /**
     * @var int
     */
    public int $timeout = 180;

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
        $this->projet->load('resultatAnalyse.exigenceDAOs');

        $documents = DocumentBibliotheque::where('entreprise_id', $this->projet->entreprise_id)
                                          ->where('is_current', true)
                                          ->get();

        $payload = [
            'projet_id'     => $this->projet->id,
            'entreprise_id' => $this->projet->entreprise_id,
            'exigences'     => $this->projet->resultatAnalyse->exigenceDAOs->map(function ($exigence) {
                return [
                    'id'              => $exigence->id,
                    'type'            => $exigence->type,
                    'description'     => $exigence->description,
                    'est_obligatoire' => $exigence->est_obligatoire,
                ];
            })->values()->toArray(),
            'documents'     => $documents->map(function ($document) {
                return [
                    'id'             => $document->id,
                    'titre'          => $document->titre,
                    'categorie'      => $document->categorie,
                    'chemin_fichier' => $document->chemin_fichier,
                ];
            })->values()->toArray(),
            'webhook_url'   => url('/api/webhook/conformite-done'),
        ];

        $response = Http::timeout(30)->post(
            config('services.ai_service.url') . '/conformite',
            $payload
        );

        if (!$response->successful()) {
            throw new \RuntimeException('FastAPI conformite unavailable');
        }
    }

    /**
     * @param \Throwable $e
     * @return void
     */
    public function failed(\Throwable $e): void
    {
        AuditLog::create([
            'user_id'          => null,
            'entreprise_id'    => $this->projet->entreprise_id,
            'action'           => 'conformite_echouee_job',
            'entite_concernee' => 'ProjetDAO:' . $this->projet->id,
            'date_action'      => now(),
        ]);
    }
}
