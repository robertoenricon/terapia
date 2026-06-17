<?php

namespace Tests\Feature;

use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class JournalEntryTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_updates_an_entry_whose_date_contains_a_time(): void
    {
        $user = User::factory()->create();

        DB::table('journal_entries')->insert([
            'user_id' => $user->id,
            'entry_date' => '2026-06-17 00:00:00',
            'category' => 'sonhos',
            'content' => 'Conteúdo antigo',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->actingAs($user)->postJson('/api/journal-entries', [
            'entry_date' => '2026-06-17',
            'category' => 'sonhos',
            'content' => 'Conteúdo alterado',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('content', 'Conteúdo alterado');

        $this->assertDatabaseCount('journal_entries', 1);
        $this->assertDatabaseHas('journal_entries', [
            'user_id' => $user->id,
            'category' => 'sonhos',
            'content' => 'Conteúdo alterado',
        ]);
    }

    public function test_it_stores_the_feedback_of_a_dream_entry(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/journal-entries', [
            'entry_date' => '2026-06-17',
            'category' => 'sonhos',
            'content' => 'Sonhei com o mar',
            'feedback' => 'Sonho tranquilo e revelador',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('feedback', 'Sonho tranquilo e revelador');

        $this->assertDatabaseHas('journal_entries', [
            'user_id' => $user->id,
            'category' => 'sonhos',
            'feedback' => 'Sonho tranquilo e revelador',
        ]);
    }

    public function test_it_stores_the_feedback_for_any_category(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/journal-entries', [
            'entry_date' => '2026-06-18',
            'category' => 'terapia',
            'content' => 'Sessão produtiva',
            'feedback' => 'Feedback de uma entrada de terapia',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('feedback', 'Feedback de uma entrada de terapia');

        $this->assertDatabaseHas('journal_entries', [
            'user_id' => $user->id,
            'category' => 'terapia',
            'feedback' => 'Feedback de uma entrada de terapia',
        ]);
    }

    public function test_it_stores_the_type_of_a_centro_entry(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/journal-entries', [
            'entry_date' => '2026-06-19',
            'category' => 'centro',
            'type' => 'umbanda',
            'content' => 'Gira de Umbanda',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('type', 'umbanda');

        $this->assertDatabaseHas('journal_entries', [
            'user_id' => $user->id,
            'category' => 'centro',
            'type' => 'umbanda',
        ]);
    }

    public function test_it_keeps_two_categories_on_the_same_date(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/journal-entries', [
            'entry_date' => '2026-06-17',
            'category' => 'terapia',
            'content' => 'Sessão de terapia',
        ])->assertCreated();

        $this->actingAs($user)->postJson('/api/journal-entries', [
            'entry_date' => '2026-06-17',
            'category' => 'sonhos',
            'content' => 'Sonho da noite',
        ])->assertCreated();

        // As duas categorias coexistem na mesma data, sem sobrescrever uma à outra.
        $this->assertDatabaseCount('journal_entries', 2);
        $this->assertDatabaseHas('journal_entries', [
            'user_id' => $user->id,
            'category' => 'terapia',
            'content' => 'Sessão de terapia',
        ]);
        $this->assertDatabaseHas('journal_entries', [
            'user_id' => $user->id,
            'category' => 'sonhos',
            'content' => 'Sonho da noite',
        ]);
    }

    public function test_show_by_date_returns_all_categories_of_the_date(): void
    {
        $user = User::factory()->create();

        JournalEntry::factory()->for($user)->create([
            'entry_date' => '2026-06-17',
            'category' => 'terapia',
        ]);
        JournalEntry::factory()->for($user)->create([
            'entry_date' => '2026-06-17',
            'category' => 'sonhos',
        ]);
        JournalEntry::factory()->for($user)->create([
            'entry_date' => '2026-06-18',
            'category' => 'evento',
        ]);

        $this->actingAs($user)
            ->getJson('/api/journal-entries/date/2026-06-17')
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.category', 'sonhos')
            ->assertJsonPath('1.category', 'terapia');
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

    public function test_it_pins_and_unpins_an_entry(): void
    {
        $user = User::factory()->create();
        $entry = JournalEntry::factory()->for($user)->create([
            'category' => 'terapia',
        ]);

        $this->actingAs($user)
            ->patchJson("/api/journal-entries/{$entry->id}/pin", ['pinned' => true])
            ->assertOk()
            ->assertJsonPath('pinned', true);

        $this->assertDatabaseHas('journal_entries', [
            'id' => $entry->id,
            'pinned' => true,
        ]);

        $this->actingAs($user)
            ->patchJson("/api/journal-entries/{$entry->id}/pin", ['pinned' => false])
            ->assertOk()
            ->assertJsonPath('pinned', false);
    }

    public function test_pinned_entries_are_listed_first(): void
    {
        $user = User::factory()->create();

        JournalEntry::factory()->for($user)->create([
            'entry_date' => '2026-06-20',
            'category' => 'terapia',
            'pinned' => false,
        ]);
        $pinned = JournalEntry::factory()->for($user)->create([
            'entry_date' => '2026-06-01',
            'category' => 'sonhos',
            'pinned' => true,
        ]);

        $this->actingAs($user)
            ->getJson('/api/journal-entries')
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.id', $pinned->id);
    }

    public function test_user_cannot_pin_another_users_entry(): void
    {
        $user = User::factory()->create();
        $otherEntry = JournalEntry::factory()
            ->for(User::factory())
            ->create(['category' => 'terapia']);

        $this->actingAs($user)
            ->patchJson("/api/journal-entries/{$otherEntry->id}/pin", ['pinned' => true])
            ->assertNotFound();

        $this->assertDatabaseHas('journal_entries', [
            'id' => $otherEntry->id,
            'pinned' => false,
        ]);
    }

    public function test_it_stars_and_unstars_an_entry(): void
    {
        $user = User::factory()->create();
        $entry = JournalEntry::factory()->for($user)->create([
            'category' => 'terapia',
        ]);

        $this->actingAs($user)
            ->patchJson("/api/journal-entries/{$entry->id}/star", ['starred' => true])
            ->assertOk()
            ->assertJsonPath('starred', true);

        $this->assertDatabaseHas('journal_entries', [
            'id' => $entry->id,
            'starred' => true,
        ]);

        $this->actingAs($user)
            ->patchJson("/api/journal-entries/{$entry->id}/star", ['starred' => false])
            ->assertOk()
            ->assertJsonPath('starred', false);
    }

    public function test_user_cannot_star_another_users_entry(): void
    {
        $user = User::factory()->create();
        $otherEntry = JournalEntry::factory()
            ->for(User::factory())
            ->create(['category' => 'terapia']);

        $this->actingAs($user)
            ->patchJson("/api/journal-entries/{$otherEntry->id}/star", ['starred' => true])
            ->assertNotFound();

        $this->assertDatabaseHas('journal_entries', [
            'id' => $otherEntry->id,
            'starred' => false,
        ]);
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
