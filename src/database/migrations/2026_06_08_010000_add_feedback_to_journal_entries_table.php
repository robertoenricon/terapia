<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adiciona a coluna de feedback às entradas do Semear.
 *
 * O feedback é um texto livre e opcional, utilizado apenas pelos registros
 * da categoria "sonhos" para anotar percepções sobre o sonho.
 */
return new class extends Migration
{
    /**
     * Executa a migração, criando a coluna de feedback.
     */
    public function up(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            // Feedback do registro: texto livre exclusivo da categoria "sonhos".
            $table->text('feedback')->nullable()->after('content');
        });
    }

    /**
     * Reverte a migração, removendo a coluna de feedback.
     */
    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropColumn('feedback');
        });
    }
};
