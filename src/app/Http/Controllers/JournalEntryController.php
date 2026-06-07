<?php

namespace App\Http\Controllers;

use App\Models\JournalEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Gerencia as entradas do diário (acontecimentos do dia).
 *
 * Disponibiliza as operações de listagem, consulta por data, criação,
 * atualização e remoção das entradas registradas pelo usuário.
 */
class JournalEntryController extends Controller
{
    /**
     * Lista as entradas do diário em ordem decrescente de data.
     *
     * @return JsonResponse Coleção de entradas registradas.
     */
    public function index(): JsonResponse
    {
        $entries = JournalEntry::orderByDesc('entry_date')->get();

        return response()->json($entries);
    }

    /**
     * Retorna a entrada correspondente à data informada, se existir.
     *
     * @param  string $date Data no formato Y-m-d.
     * @return JsonResponse  Entrada encontrada ou objeto nulo.
     */
    public function showByDate(string $date): JsonResponse
    {
        $entry = JournalEntry::whereDate('entry_date', $date)->first();

        return response()->json($entry);
    }

    /**
     * Cria ou atualiza a entrada de uma data e categoria
     * (uma entrada por categoria em cada dia).
     *
     * @param  Request $request Requisição com a data e o conteúdo.
     * @return JsonResponse      Entrada salva com status apropriado.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'entry_date' => ['required', 'date'],
            'category' => ['required', 'in:terapia,sonhos'],
            'content' => ['nullable', 'string', 'max:50000'],
        ]);

        $entry = JournalEntry::updateOrCreate(
            ['entry_date' => $data['entry_date'], 'category' => $data['category']],
            ['content' => $data['content'] ?? ''],
        );

        return response()->json($entry, $entry->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Remove a entrada informada do diário.
     *
     * @param  JournalEntry $journalEntry Entrada a ser removida.
     * @return JsonResponse                Resposta vazia de confirmação.
     */
    public function destroy(JournalEntry $journalEntry): JsonResponse
    {
        $journalEntry->delete();

        return response()->json(null, 204);
    }
}
