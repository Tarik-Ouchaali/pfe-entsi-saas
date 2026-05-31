<?php

namespace App\Console\Commands;

use App\Models\Abonnement;
use App\Services\AbonnementService;
use Illuminate\Console\Command;

class RenouvelerAbonnementsCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'abonnements:renouveler';

    /**
     * @var string
     */
    protected $description = 'Renouvelle les abonnements expirés et applique les downgrades en attente';

    /**
     * @param AbonnementService $abonnementService
     */
    public function __construct(private AbonnementService $abonnementService)
    {
        parent::__construct();
    }

    /**
     * @return void
     */
    public function handle(): void
    {
        $abonnements = Abonnement::where('date_fin', '<=', now())
            ->where('statut', 'actif')
            ->with('entreprise', 'planSaaS', 'nextPlan')
            ->get();

        $count = $abonnements->count();

        foreach ($abonnements as $abonnement) {
            $this->abonnementService->renouvelerAbonnement($abonnement);
        }

        $this->info("{$count} abonnement(s) renouvelé(s).");
    }
}
