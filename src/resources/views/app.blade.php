<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- Cor da barra de status no mobile: combina com o fundo escuro do app
             para eliminar a faixa branca no topo em iOS/Android. -->
        <meta name="theme-color" content="#0a1014">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

        <!-- Favicon: emoji 🌱 desenhado via SVG inline (sem arquivo de imagem) -->
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>%F0%9F%8C%B1</text></svg>">

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
