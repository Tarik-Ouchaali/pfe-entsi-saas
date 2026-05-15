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
        Schema::create('resultat_analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_dao_id')->unique()->constrained('projet_daos')->cascadeOnDelete();
            $table->text('resume_global')->nullable();
            $table->timestamp('date_analyse')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resultat_analyses');
    }
};
