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
        Schema::create('conformite_checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exigence_dao_id')->constrained('exigence_daos')->cascadeOnDelete();
            $table->foreignId('document_bibliotheque_id')->nullable()->constrained('document_bibliotheques')->nullOnDelete();
            $table->enum('statut', ['conforme', 'manquant', 'expire']);
            $table->timestamp('date_verification')->nullable();
            $table->decimal('score_global', 5, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conformite_checklists');
    }
};
