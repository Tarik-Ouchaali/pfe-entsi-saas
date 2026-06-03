<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * @return void
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE document_bibliotheques ALTER COLUMN document_groupe_id TYPE varchar(36) USING document_groupe_id::varchar');
    }

    /**
     * @return void
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE document_bibliotheques ALTER COLUMN document_groupe_id TYPE bigint USING document_groupe_id::bigint');
    }
};
