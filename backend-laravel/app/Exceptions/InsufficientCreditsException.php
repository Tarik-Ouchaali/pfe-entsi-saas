<?php

namespace App\Exceptions;

use Exception;

class InsufficientCreditsException extends Exception
{
    /**
     * @param int $creditsRequis
     * @param int $creditsDisponibles
     */
    public function __construct(
        private readonly int $creditsRequis,
        private readonly int $creditsDisponibles,
    ) {
        parent::__construct(
            "Crédits insuffisants. Requis: {$creditsRequis}, Disponibles: {$creditsDisponibles}."
        );
    }

    /**
     * @return int
     */
    public function getCreditsRequis(): int
    {
        return $this->creditsRequis;
    }

    /**
     * @return int
     */
    public function getCreditsDisponibles(): int
    {
        return $this->creditsDisponibles;
    }

    /**
     * @return int
     */
    public function getCreditsManquants(): int
    {
        return $this->creditsRequis - $this->creditsDisponibles;
    }
}
