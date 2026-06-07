<?php

namespace Database\Factories;

use App\Models\JournalEntry;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Fábrica de dados de teste para entradas do Semear.
 *
 * @extends Factory<JournalEntry>
 */
class JournalEntryFactory extends Factory
{
    /**
     * Modelo associado a esta fábrica.
     *
     * @var class-string<JournalEntry>
     */
    protected $model = JournalEntry::class;

    /**
     * Define o estado padrão de uma entrada gerada.
     *
     * @return array<string, mixed> Atributos da entrada de teste.
     */
    public function definition(): array
    {
        return [
            'entry_date' => $this->faker->unique()->date(),
            'category' => $this->faker->randomElement(['terapia', 'sonhos']),
            'content' => '<p>'.$this->faker->sentence().'</p>',
        ];
    }
}
