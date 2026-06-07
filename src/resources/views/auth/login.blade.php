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
                        <h1 id="login-title" class="login-card__title">Acesse seu diário</h1>
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
                        <input
                            id="password"
                            name="password"
                            type="password"
                            class="form-control login-form__input @error('password') is-invalid @enderror"
                            autocomplete="current-password"
                            required
                        >
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

                    <button type="submit" class="diary-save-btn login-form__submit">
                        Entrar
                    </button>
                </form>
            </section>
        </main>
    </body>
</html>
