<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Terapia') }}</title>

        <!-- Estilos e scripts compilados pelo Vite (React + Bootstrap 5) -->
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </head>
    <body>
        <!-- Elemento raiz onde a aplicação React é montada -->
        <div
            id="app"
            data-user-name="{{ auth()->user()->name }}"
        ></div>
    </body>
</html>
