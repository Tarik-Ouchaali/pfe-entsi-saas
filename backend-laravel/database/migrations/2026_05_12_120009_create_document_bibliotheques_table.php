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
        Schema::create('document_bibliotheques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('entreprise_id')->constrained('entreprises')->cascadeOnDelete();
            $table->unsignedBigInteger('document_groupe_id')->nullable();
            $table->string('titre');
            $table->string('categorie');
            $table->string('chemin_fichier');
            $table->date('date_expiration')->nullable();
            $table->integer('version')->default(1);
            $table->boolean('is_current')->default(true);
            $table->timestamp('date_upload');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_bibliotheques');
    }
};
