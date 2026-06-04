<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * @return void
     */
    public function up(): void
    {
        Schema::table('memoire_techniques', function (Blueprint $table) {
            $table->string('statut')->default('En_generation')->after('projet_dao_id');
        });
    }

    /**
     * @return void
     */
    public function down(): void
    {
        Schema::table('memoire_techniques', function (Blueprint $table) {
            $table->dropColumn('statut');
        });
    }
};
