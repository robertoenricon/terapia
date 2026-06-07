<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_semear_to_login(): void
    {
        $this->get('/semear')
            ->assertRedirect('/login');
    }

    public function test_guest_cannot_access_journal_api(): void
    {
        $this->getJson('/api/journal-entries')
            ->assertUnauthorized();
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'password' => 'senha-segura',
        ]);

        $this->post('/login', [
            'name' => $user->name,
            'password' => 'senha-segura',
        ])
            ->assertRedirect('/semear');

        $this->assertAuthenticatedAs($user);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        $user = User::factory()->create([
            'password' => 'senha-segura',
        ]);

        $this->from('/login')->post('/login', [
            'name' => $user->name,
            'password' => 'senha-incorreta',
        ])
            ->assertRedirect('/login')
            ->assertSessionHasErrors('name');

        $this->assertGuest();
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/logout')
            ->assertRedirect('/login');

        $this->assertGuest();
    }
}
