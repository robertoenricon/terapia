<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\JournalEntry;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate([
            'name' => config('admin.name'),
        ], [
            'password' => config('admin.password'),
        ]);

        JournalEntry::query()
            ->whereNull('user_id')
            ->update(['user_id' => $admin->id]);
    }
}
