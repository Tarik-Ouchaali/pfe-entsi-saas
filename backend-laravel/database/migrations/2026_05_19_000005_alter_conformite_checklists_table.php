<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * @return void
     */
    public function up(): void
    {
        Schema::table('conformite_checklists', function (Blueprint $table) {
            $table->foreignId('projet_dao_id')
                  ->after('id')
                  ->constrained('projet_daos')
                  ->cascadeOnDelete();
        });

        DB::statement('ALTER TABLE conformite_checklists ALTER COLUMN statut TYPE varchar(255)');

        Schema::table('conformite_checklists', function (Blueprint $table) {
            $table->index(['projet_dao_id', 'exigence_dao_id']);
        });
    }

    /**
     * @return void
     */
    public function down(): void
    {
        Schema::table('conformite_checklists', function (Blueprint $table) {
            $table->dropIndex(['projet_dao_id', 'exigence_dao_id']);
        });

        DB::statement("ALTER TABLE conformite_checklists ALTER COLUMN statut TYPE varchar(255)");
        DB::statement("DROP TYPE IF EXISTS conformite_checklists_statut_check");
        DB::statement("ALTER TABLE conformite_checklists ADD CONSTRAINT conformite_checklists_statut_check CHECK (statut IN ('conforme', 'manquant', 'expire'))");

        Schema::table('conformite_checklists', function (Blueprint $table) {
            $table->dropForeign(['projet_dao_id']);
            $table->dropColumn('projet_dao_id');
        });
    }
};
