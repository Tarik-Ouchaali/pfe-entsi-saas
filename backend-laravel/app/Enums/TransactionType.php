<?php

namespace App\Enums;

enum TransactionType: string
{
    case ANALYSE_DAO         = 'analyse_dao';
    case MEMOIRE_TECHNIQUE   = 'memoire_technique';
    case ACHAT_PACK          = 'achat_pack';
    case RECHARGE_ABONNEMENT = 'recharge_abonnement';
    case REMBOURSEMENT       = 'remboursement';
    case AJUSTEMENT_MANUEL   = 'ajustement_manuel';

    /**
     * @return string
     */
    public function label(): string
    {
        return match ($this) {
            self::ANALYSE_DAO         => 'Analyse DAO',
            self::MEMOIRE_TECHNIQUE   => 'Mémoire technique',
            self::ACHAT_PACK          => 'Achat de pack',
            self::RECHARGE_ABONNEMENT => 'Recharge abonnement',
            self::REMBOURSEMENT       => 'Remboursement',
            self::AJUSTEMENT_MANUEL   => 'Ajustement manuel',
        };
    }

    /**
     * @return bool
     */
    public function isCredit(): bool
    {
        return match ($this) {
            self::ACHAT_PACK,
            self::RECHARGE_ABONNEMENT,
            self::REMBOURSEMENT,
            self::AJUSTEMENT_MANUEL => true,

            self::ANALYSE_DAO,
            self::MEMOIRE_TECHNIQUE => false,
        };
    }
}
