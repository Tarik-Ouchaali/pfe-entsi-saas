<?php

namespace App\Jobs;

use App\Mail\AnalyseEchoueMail;
use App\Models\AuditLog;
use App\Models\ProjetDAO;
use App\Services\CreditService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class AnalyseDAOJob implements ShouldQueue
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
        $document = $this->projet->documentDAOs()->firstOrFail();

        $response = Http::timeout(30)->post(
            config('services.ai_service.url') . '/analyse',
            [
                'projet_id'     => $this->projet->id,
                'entreprise_id' => $this->projet->entreprise_id,
                'file_path'     => $document->chemin_fichier,
                'webhook_url'   => url('/api/webhook/analysis-done'),
            ]
        );

        if (!$response->successful()) {
            throw new \RuntimeException('FastAPI unavailable: ' . $response->status());
        }
    }

    /**
     * @param \Throwable $e
     * @return void
     */
    public function failed(\Throwable $e): void
    {
        $this->projet->refresh();
        $this->projet->update(['statut' => 'Echoue']);

        app(CreditService::class)->rembourserCredit($this->projet->entreprise, $this->projet->id);

        Mail::to($this->projet->user->email)->send(new AnalyseEchoueMail($this->projet, $e->getMessage()));

        AuditLog::create([
            'user_id'          => null,
            'entreprise_id'    => $this->projet->entreprise_id,
            'action'           => 'analyse_echouee_job',
            'entite_concernee' => 'ProjetDAO:' . $this->projet->id,
            'date_action'      => now(),
        ]);
    }
}
