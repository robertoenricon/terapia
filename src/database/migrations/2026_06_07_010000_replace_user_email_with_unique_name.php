<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'email')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropUnique(['email']);
                $table->dropColumn(['email', 'email_verified_at']);
                $table->unique('name');
            });
        }

        Schema::dropIfExists('password_reset_tokens');
    }

    public function down(): void
    {
        // A remoção dos dados de e-mail é intencional e não reversível.
    }
};
