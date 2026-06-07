<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Remove a restrição de unicidade (usuário + data + categoria) das entradas.
 *
 * Passa a permitir vários registros da mesma categoria na mesma data para
 * um mesmo usuário (ex.: dois eventos no mesmo dia).
 */
return new class extends Migration
{
    /**
     * Executa a migração, removendo o índice único de usuário, data e categoria.
     */
    public function up(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'entry_date', 'category']);
        });
    }

    /**
     * Reverte a migração, recriando o índice único de usuário, data e categoria.
     */
    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->unique(['user_id', 'entry_date', 'category']);
        });
    }
};
