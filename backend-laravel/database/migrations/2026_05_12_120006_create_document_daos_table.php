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
        Schema::create('document_daos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_dao_id')->constrained('projet_daos')->cascadeOnDelete();
            $table->string('nom_fichier');
            $table->string('chemin_fichier');
            $table->string('type_fichier');
            $table->integer('taille');
            $table->timestamp('date_upload');
            $table->timestamps();
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_daos');
    }
};
