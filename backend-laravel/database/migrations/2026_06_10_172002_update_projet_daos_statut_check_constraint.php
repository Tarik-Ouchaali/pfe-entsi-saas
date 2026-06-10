<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE projet_daos
            DROP CONSTRAINT IF EXISTS projet_daos_statut_check
        ");

        DB::statement("
            ALTER TABLE projet_daos
            ADD CONSTRAINT projet_daos_statut_check
            CHECK (
                statut IN (
                    'Nouveau',
                    'En_analyse',
                    'Termine',
                    'Echoue'
                )
            )
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE projet_daos
            DROP CONSTRAINT IF EXISTS projet_daos_statut_check
        ");

        DB::statement("
            ALTER TABLE projet_daos
            ADD CONSTRAINT projet_daos_statut_check
            CHECK (
                statut IN (
                    'Nouveau',
                    'En_analyse',
                    'Termine'
                )
            )
        ");
    }
};