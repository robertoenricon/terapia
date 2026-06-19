<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Remove a restrição de unicidade por usuário, data e categoria das entradas.
 *
 * Permite que uma mesma data possua mais de um registro da mesma categoria,
 * possibilitando o cadastro de vários registros no mesmo dia.
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
     * Reverte a migração, restaurando o índice único de usuário, data e categoria.
     */
    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->unique(['user_id', 'entry_date', 'category']);
        });
    }
};
