<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('entreprises', function (Blueprint $table) {
            $table->dropColumn('credits_restants');
            $table->integer('abonnement_credits_restants')->default(0)->after('adresse');
            $table->integer('pack_credits_restants')->default(0)->after('abonnement_credits_restants');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entreprises', function (Blueprint $table) {
            $table->dropColumn(['abonnement_credits_restants', 'pack_credits_restants']);
            $table->integer('credits_restants')->default(0)->after('adresse');
        });
    }
};
