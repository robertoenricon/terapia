<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adiciona a coluna de tipo às entradas do Semear.
 *
 * O tipo classifica o registro pela sua natureza ("pesadelo", "medio",
 * "bom" ou "otimo") e é opcional, exibido junto ao título na listagem.
 */
return new class extends Migration
{
    /**
     * Executa a migração, criando a coluna de tipo.
     */
    public function up(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            // Tipo do registro: "pesadelo", "medio", "bom" ou "otimo".
            $table->string('type')->nullable()->after('category');
        });
    }

    /**
     * Reverte a migração, removendo a coluna de tipo.
     */
    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
