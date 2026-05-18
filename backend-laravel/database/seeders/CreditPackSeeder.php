<?php

namespace Database\Seeders;

use App\Models\CreditPack;
use Illuminate\Database\Seeder;

class CreditPackSeeder extends Seeder
{
    /**
     * Seed the credit_packs table with default purchasable packs.
     */
    public function run(): void
    {
        $packs = [
            [
                'nom' => 'Pack S',
                'credits' => 10,
                'prix' => 89.00,
                'is_active' => true,
            ],
            [
                'nom' => 'Pack M',
                'credits' => 30,
                'prix' => 249.00,
                'is_active' => true,
            ],
            [
                'nom' => 'Pack L',
                'credits' => 100,
                'prix' => 749.00,
                'is_active' => true,
            ],
        ];

        foreach ($packs as $pack) {
            CreditPack::updateOrCreate(
                ['nom' => $pack['nom']],
                $pack
            );
        }
    }
}
