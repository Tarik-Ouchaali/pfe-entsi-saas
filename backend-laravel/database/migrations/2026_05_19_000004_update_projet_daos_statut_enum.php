<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * @return void
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE projet_daos ALTER COLUMN statut TYPE varchar(255)');
        DB::statement("ALTER TABLE projet_daos ALTER COLUMN statut SET DEFAULT 'Nouveau'");
    }

    /**
     * @return void
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE projet_daos ALTER COLUMN statut SET DEFAULT 'Nouveau'");
        DB::statement("ALTER TABLE projet_daos ALTER COLUMN statut TYPE varchar(255)");
        DB::statement("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'projet_daos_statut_enum') THEN CREATE TYPE projet_daos_statut_enum AS ENUM ('Nouveau', 'En_analyse', 'Termine'); END IF; END $$;");
        DB::statement("ALTER TABLE projet_daos ALTER COLUMN statut TYPE projet_daos_statut_enum USING statut::projet_daos_statut_enum");
        DB::statement("ALTER TABLE projet_daos ALTER COLUMN statut SET DEFAULT 'Nouveau'");
    }
};
