<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adiciona a coluna de título às entradas do Semear.
 *
 * O título é um rótulo curto e opcional, exibido na lista de registros
 * no lugar do dia da semana.
 */
return new class extends Migration
{
    /**
     * Executa a migração, criando a coluna de título.
     */
    public function up(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            // Título curto e opcional da entrada.
            $table->string('title')->nullable()->after('category');
        });
    }

    /**
     * Reverte a migração, removendo a coluna de título.
     */
    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropColumn('title');
        });
    }
};
