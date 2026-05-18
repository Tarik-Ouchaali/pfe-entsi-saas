<?php

namespace Database\Seeders;

use App\Models\PlanSaaS;
use Illuminate\Database\Seeder;

class PlanSaaSSeeder extends Seeder
{
    /**
     * Seed the plan_saas table with default subscription plans.
     */
    public function run(): void
    {
        $plans = [
            [
                'nom_plan' => 'Starter',
                'prix' => 0.00,
                'credits_alloues' => 5,
                'description' => 'Plan gratuit avec 5 crédits offerts pour découvrir la plateforme.',
            ],
            [
                'nom_plan' => 'Professional',
                'prix' => 299.00,
                'credits_alloues' => 50,
                'description' => 'Plan professionnel avec 50 crédits mensuels et support prioritaire.',
            ],
            [
                'nom_plan' => 'Business',
                'prix' => 799.00,
                'credits_alloues' => 150,
                'description' => 'Plan business avec 150 crédits mensuels, support dédié et formation incluse.',
            ],
        ];

        foreach ($plans as $plan) {
            PlanSaaS::updateOrCreate(
                ['nom_plan' => $plan['nom_plan']],
                $plan
            );
        }
    }
}
