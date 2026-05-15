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
        Schema::create('exigence_daos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resultat_analyse_id')->constrained('resultat_analyses')->cascadeOnDelete();
            $table->enum('type', ['administratif', 'technique']);
            $table->text('description');
            $table->boolean('est_obligatoire')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exigence_daos');
    }
};
