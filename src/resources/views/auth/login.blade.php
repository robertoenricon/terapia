<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Login | {{ config('app.name', 'Terapia') }}</title>

        @vite(['resources/css/app.css'])
    </head>
    <body>
        <main class="login-page">
            <section class="login-card" aria-labelledby="login-title">
                <div class="login-card__brand">
                    <span class="login-card__logo">🌱</span>
                    <div>
                        <h1 id="login-title" class="login-card__title">Acesse o Semear</h1>
                        <p class="login-card__subtitle">Entre para continuar seus registros.</p>
                    </div>
                </div>

                @if ($errors->any())
                    <div class="alert alert-danger login-card__alert" role="alert">
                        {{ $errors->first() }}
                    </div>
                @endif

                <form method="POST" action="{{ route('login.store') }}" class="login-form">
                    @csrf

                    <div>
                        <label for="name" class="login-form__label">Nome</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            class="form-control login-form__input @error('name') is-invalid @enderror"
                            value="{{ old('name') }}"
                            autocomplete="username"
                            required
                            autofocus
                        >
                    </div>

                    <div>
                        <label for="password" class="login-form__label">Senha</label>
                        <div class="login-form__password">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                class="form-control login-form__input @error('password') is-invalid @enderror"
                                autocomplete="current-password"
                                required
                            >
                            <button
                                type="button"
                                id="togglePassword"
                                class="login-form__toggle"
                                aria-label="Mostrar senha"
                                aria-pressed="false"
                            >
                                {{-- Ícone de olho aberto (senha oculta). --}}
                                <svg class="login-form__eye" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                {{-- Ícone de olho cortado (senha visível). --}}
                                <svg class="login-form__eye-off" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                                    <line x1="2" y1="2" x2="22" y2="22"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <label class="login-form__remember">
                        <input
                            name="remember"
                            type="checkbox"
                            class="form-check-input"
                            value="1"
                        >
                        Manter conectado
                    </label>

                    <button type="submit" class="semear-save-btn login-form__submit">
                        Entrar
                    </button>
                </form>
            </section>
        </main>

        {{-- Alterna a visibilidade da senha ao clicar no botão de olho. --}}
        <script>
            (function () {
                const toggle = document.getElementById('togglePassword');
                const input = document.getElementById('password');

                if (!toggle || !input) {
                    return;
                }

                toggle.addEventListener('click', function () {
                    const show = input.type === 'password';
                    input.type = show ? 'text' : 'password';
                    toggle.classList.toggle('login-form__toggle--visible', show);
                    toggle.setAttribute('aria-pressed', String(show));
                    toggle.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
                });
            })();
        </script>
    </body>
</html>
