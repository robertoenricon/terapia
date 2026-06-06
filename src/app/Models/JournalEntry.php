<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Representa uma entrada do diário referente a uma data específica.
 *
 * Cada entrada guarda os acontecimentos, pensamentos e sentimentos
 * registrados pelo usuário em um determinado dia.
 */
#[Fillable(['entry_date', 'content'])]
class JournalEntry extends Model
{
    /** @use HasFactory<\Database\Factories\JournalEntryFactory> */
    use HasFactory;

    /**
     * Define a conversão de tipos dos atributos do modelo.
     *
     * @return array<string, string> Mapa de atributos e seus tipos.
     */
    protected function casts(): array
    {
        return [
            'entry_date' => 'date',
        ];
    }
}
