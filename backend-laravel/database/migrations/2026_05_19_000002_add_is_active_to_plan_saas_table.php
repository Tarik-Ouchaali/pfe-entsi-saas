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
        Schema::table('plan_saas', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('credits_alloues');
        });
    }

    /**
     * @return void
     */
    public function down(): void
    {
        Schema::table('plan_saas', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }
};
