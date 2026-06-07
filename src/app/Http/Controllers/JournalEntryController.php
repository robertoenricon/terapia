<?php

namespace App\Http\Controllers;

use App\Models\JournalEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Gerencia as entradas do Semear (acontecimentos do dia).
 *
 * Disponibiliza as operações de listagem, consulta por data, criação,
 * atualização e remoção das entradas registradas pelo usuário.
 */
class JournalEntryController extends Controller
{
    /**
     * Lista as entradas do Semear em ordem decrescente de data.
     *
     * @return JsonResponse Coleção de entradas registradas.
     */
    public function index(Request $request): JsonResponse
    {
        $entries = $request->user()
            ->journalEntries()
            ->orderByDesc('entry_date')
            ->orderByDesc('id')
            ->get();

        return response()->json($entries);
    }

    /**
     * Retorna a entrada correspondente à data informada, se existir.
     *
     * @param  string $date Data no formato Y-m-d.
     * @return JsonResponse  Entrada encontrada ou objeto nulo.
     */
    public function showByDate(Request $request, string $date): JsonResponse
    {
        $entry = $request->user()
            ->journalEntries()
            ->whereDate('entry_date', $date)
            ->first();

        return response()->json($entry);
    }

    /**
     * Cria uma nova entrada para a data e categoria informadas.
     *
     * Uma mesma data e categoria podem ter vários registros (ex.: dois
     * eventos no mesmo dia); cada chamada cria um registro independente.
     *
     * @param  Request $request Requisição com a data, a categoria e o conteúdo.
     * @return JsonResponse      Entrada criada (status 201).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'entry_date' => ['required', 'date'],
            'category' => ['required', 'in:terapia,sonhos,evento'],
            'content' => ['nullable', 'string', 'max:50000'],
        ]);

        $entry = $request->user()->journalEntries()->create([
            'entry_date' => $data['entry_date'],
            'category' => $data['category'],
            'content' => $data['content'] ?? '',
        ]);

        return response()->json($entry, 201);
    }

    /**
     * Atualiza o conteúdo de uma entrada existente.
     *
     * @param  Request      $request      Requisição com o novo conteúdo.
     * @param  JournalEntry $journalEntry Entrada a ser atualizada.
     * @return JsonResponse                Entrada atualizada.
     */
    public function update(Request $request, JournalEntry $journalEntry): JsonResponse
    {
        abort_unless($journalEntry->user_id === $request->user()->id, 404);

        $data = $request->validate([
            'content' => ['nullable', 'string', 'max:50000'],
        ]);

        $journalEntry->content = $data['content'] ?? '';
        $journalEntry->save();

        return response()->json($journalEntry);
    }

    /**
     * Remove a entrada informada do Semear.
     *
     * @param  JournalEntry $journalEntry Entrada a ser removida.
     * @return JsonResponse                Resposta vazia de confirmação.
     */
    public function destroy(Request $request, JournalEntry $journalEntry): JsonResponse
    {
        abort_unless($journalEntry->user_id === $request->user()->id, 404);

        $journalEntry->delete();

        return response()->json(null, 204);
    }
}
