<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Em produção, força a geração de URLs com "https".
        // Evita "mixed content" (assets carregados por http) e mantém o
        // cadeado de segurança intacto quando o site roda atrás de SSL.
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
