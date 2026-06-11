<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Representa uma entrada do Semear referente a uma data específica.
 *
 * Cada entrada guarda os acontecimentos, pensamentos e sentimentos
 * registrados pelo usuário em um determinado dia.
 */
#[Fillable(['user_id', 'entry_date', 'category', 'type', 'title', 'content', 'feedback', 'pinned', 'starred'])]
class JournalEntry extends Model
{
    /** @use HasFactory<\Database\Factories\JournalEntryFactory> */
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Define a conversão de tipos dos atributos do modelo.
     *
     * @return array<string, string> Mapa de atributos e seus tipos.
     */
    protected function casts(): array
    {
        return [
            'entry_date' => 'date',
            'pinned' => 'boolean',
            'starred' => 'boolean',
        ];
    }
}
