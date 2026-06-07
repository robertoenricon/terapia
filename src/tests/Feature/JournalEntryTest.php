<?php

namespace Tests\Feature;

use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JournalEntryTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_new_entry(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/journal-entries', [
            'entry_date' => '2026-06-17',
            'category' => 'evento',
            'content' => 'ProcessMind - Dia 01',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('content', 'ProcessMind - Dia 01');

        $this->assertDatabaseCount('journal_entries', 1);
    }

    public function test_it_allows_multiple_entries_on_the_same_day_and_category(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/journal-entries', [
            'entry_date' => '2026-06-17',
            'category' => 'evento',
            'content' => 'ProcessMind - Dia 01',
        ])->assertCreated();

        $this->actingAs($user)->postJson('/api/journal-entries', [
            'entry_date' => '2026-06-17',
            'category' => 'evento',
            'content' => 'ProcessMind - Dia 02',
        ])->assertCreated();

        $this->assertDatabaseCount('journal_entries', 2);
    }

    public function test_it_updates_an_entry_by_id(): void
    {
        $user = User::factory()->create();
        $entry = JournalEntry::factory()->for($user)->create([
            'category' => 'sonhos',
            'content' => 'Conteúdo antigo',
        ]);

        $response = $this->actingAs($user)->putJson("/api/journal-entries/{$entry->id}", [
            'content' => 'Conteúdo alterado',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('content', 'Conteúdo alterado');

        $this->assertDatabaseCount('journal_entries', 1);
        $this->assertDatabaseHas('journal_entries', [
            'id' => $entry->id,
            'content' => 'Conteúdo alterado',
        ]);
    }

    public function test_user_cannot_update_another_users_entry(): void
    {
        $user = User::factory()->create();
        $otherEntry = JournalEntry::factory()
            ->for(User::factory())
            ->create(['category' => 'terapia', 'content' => 'Original']);

        $this->actingAs($user)
            ->putJson("/api/journal-entries/{$otherEntry->id}", [
                'content' => 'Invasão',
            ])
            ->assertNotFound();

        $this->assertDatabaseHas('journal_entries', [
            'id' => $otherEntry->id,
            'content' => 'Original',
        ]);
    }

    public function test_users_only_receive_their_own_entries(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        JournalEntry::factory()->for($user)->create([
            'category' => 'terapia',
        ]);
        JournalEntry::factory()->for($otherUser)->create([
            'category' => 'sonhos',
        ]);

        $this->actingAs($user)
            ->getJson('/api/journal-entries')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.user_id', $user->id);
    }

    public function test_user_cannot_delete_another_users_entry(): void
    {
        $user = User::factory()->create();
        $otherEntry = JournalEntry::factory()
            ->for(User::factory())
            ->create(['category' => 'terapia']);

        $this->actingAs($user)
            ->deleteJson("/api/journal-entries/{$otherEntry->id}")
            ->assertNotFound();

        $this->assertDatabaseHas('journal_entries', [
            'id' => $otherEntry->id,
        ]);
    }
}
