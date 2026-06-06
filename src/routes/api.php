<?php

use App\Http\Controllers\JournalEntryController;
use Illuminate\Support\Facades\Route;

/*
| Rotas da API do diário (acontecimentos do dia).
| Todas respondem em JSON e ficam sob o prefixo "/api".
*/

Route::get('journal-entries', [JournalEntryController::class, 'index']);
Route::get('journal-entries/date/{date}', [JournalEntryController::class, 'showByDate']);
Route::post('journal-entries', [JournalEntryController::class, 'store']);
Route::delete('journal-entries/{journalEntry}', [JournalEntryController::class, 'destroy']);
