<?php

use App\Http\Controllers\JournalEntryController;
use Illuminate\Support\Facades\Route;

/*
| Rotas da API do Semear (acontecimentos do dia).
| Todas respondem em JSON e ficam sob o prefixo "/api".
*/

Route::middleware(['web', 'auth'])->group(function () {
    Route::get('journal-entries', [JournalEntryController::class, 'index']);
    Route::get('journal-entries/date/{date}', [JournalEntryController::class, 'showByDate']);
    Route::post('journal-entries', [JournalEntryController::class, 'store']);
    Route::patch('journal-entries/{journalEntry}/pin', [JournalEntryController::class, 'togglePin']);
    Route::patch('journal-entries/{journalEntry}/star', [JournalEntryController::class, 'toggleStar']);
    Route::delete('journal-entries/{journalEntry}', [JournalEntryController::class, 'destroy']);
});
