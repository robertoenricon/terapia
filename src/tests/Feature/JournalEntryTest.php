<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class JournalEntryTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_updates_an_entry_whose_date_contains_a_time(): void
    {
        DB::table('journal_entries')->insert([
            'entry_date' => '2026-06-17 00:00:00',
            'category' => 'sonhos',
            'content' => 'Conteúdo antigo',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->postJson('/api/journal-entries', [
            'entry_date' => '2026-06-17',
            'category' => 'sonhos',
            'content' => 'Conteúdo alterado',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('content', 'Conteúdo alterado');

        $this->assertDatabaseCount('journal_entries', 1);
        $this->assertDatabaseHas('journal_entries', [
            'category' => 'sonhos',
            'content' => 'Conteúdo alterado',
        ]);
    }
}
