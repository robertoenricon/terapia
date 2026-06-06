<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Cria a tabela que armazena as entradas do diário.
 *
 * Cada registro representa os acontecimentos anotados em uma data específica.
 */
return new class extends Migration
{
    /**
     * Executa a migração, criando a tabela de entradas do diário.
     */
    public function up(): void
    {
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            // Data à qual a entrada se refere (única, uma entrada por dia).
            $table->date('entry_date')->unique();
            // Conteúdo em HTML simples digitado pelo usuário.
            $table->text('content')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverte a migração, removendo a tabela de entradas do diário.
     */
    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};
