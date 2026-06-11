<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adiciona a coluna de estrela (favorito) às entradas do Semear.
 *
 * Quando verdadeira, a entrada é marcada com uma estrela, permitindo
 * destacar os registros favoritos e filtrá-los na listagem.
 */
return new class extends Migration
{
    /**
     * Executa a migração, criando a coluna de estrela.
     */
    public function up(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            // Indica se a entrada está marcada como favorita (estrela).
            $table->boolean('starred')->default(false)->after('pinned');
        });
    }

    /**
     * Reverte a migração, removendo a coluna de estrela.
     */
    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropColumn('starred');
        });
    }
};
