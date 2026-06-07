<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Cria a tabela que armazena as entradas do Semear.
 *
 * Cada registro representa os acontecimentos anotados em uma data específica.
 */
return new class extends Migration
{
    /**
     * Executa a migração, criando a tabela de entradas do Semear.
     */
    public function up(): void
    {
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            // Data à qual a entrada se refere.
            $table->date('entry_date');
            // Categoria da entrada: "terapia", "sonhos" ou "evento".
            $table->string('category');
            // Conteúdo em HTML simples digitado pelo usuário.
            $table->text('content')->nullable();
            $table->timestamps();

            // Uma entrada por data e categoria (ex.: Terapia e Sonhos no mesmo dia).
            $table->unique(['entry_date', 'category']);
        });
    }

    /**
     * Reverte a migração, removendo a tabela de entradas do Semear.
     */
    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};
