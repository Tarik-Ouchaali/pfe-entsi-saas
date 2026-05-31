<?php

namespace App\Exceptions;

use Exception;

class AnalysisFailedException extends Exception
{
    /**
     * @param int $projetId
     * @param string $raison
     */
    public function __construct(
        private readonly int $projetId,
        private readonly string $raison,
    ) {
        parent::__construct("Analyse échouée pour le projet #{$projetId}: {$raison}");
    }

    /**
     * @return int
     */
    public function getProjetId(): int
    {
        return $this->projetId;
    }

    /**
     * @return string
     */
    public function getRaison(): string
    {
        return $this->raison;
    }
}
