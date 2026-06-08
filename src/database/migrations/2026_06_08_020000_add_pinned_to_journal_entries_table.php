<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adiciona a coluna de fixação às entradas do Semear.
 *
 * Quando verdadeira, a entrada é destacada e exibida no topo da listagem,
 * permitindo fixar os registros mais importantes diretamente na lista.
 */
return new class extends Migration
{
    /**
     * Executa a migração, criando a coluna de fixação.
     */
    public function up(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            // Indica se a entrada está fixada (exibida no topo da listagem).
            $table->boolean('pinned')->default(false)->after('feedback');
        });
    }

    /**
     * Reverte a migração, removendo a coluna de fixação.
     */
    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropColumn('pinned');
        });
    }
};
