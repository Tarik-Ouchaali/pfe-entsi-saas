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
        Schema::table('abonnements', function (Blueprint $table) {
            $table->foreignId('next_plan_id')
                ->nullable()
                ->after('plan_saas_id')
                ->constrained('plan_saas')
                ->nullOnDelete();
        });
    }

    /**
     * @return void
     */
    public function down(): void
    {
        Schema::table('abonnements', function (Blueprint $table) {
            $table->dropForeign(['next_plan_id']);
            $table->dropColumn('next_plan_id');
        });
    }
};
