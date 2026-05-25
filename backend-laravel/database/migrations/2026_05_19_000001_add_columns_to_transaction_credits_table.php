<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * @return void
     */
    public function up(): void
    {
        Schema::table('transaction_credits', function (Blueprint $table): void {
            $table->foreignId('user_id')
                ->nullable()
                ->after('entreprise_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('projet_id')
                ->nullable()
                ->after('user_id')
                ->constrained('projet_daos')
                ->nullOnDelete();
        });

        DB::statement('ALTER TABLE transaction_credits ALTER COLUMN type_transaction TYPE varchar(255)');

        Schema::table('transaction_credits', function (Blueprint $table): void {
            $table->index(['entreprise_id', 'date_transaction']);
        });
    }

    /**
     * @return void
     */
    public function down(): void
    {
        Schema::table('transaction_credits', function (Blueprint $table): void {
            $table->dropIndex(['entreprise_id', 'date_transaction']);
        });

        DB::statement("ALTER TABLE transaction_credits ALTER COLUMN type_transaction TYPE varchar(255)");
        DB::statement("DROP TYPE IF EXISTS transaction_credits_type_transaction_check");

        Schema::table('transaction_credits', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('projet_id');
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
