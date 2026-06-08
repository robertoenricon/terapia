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
            ->orderByDesc('pinned')
            ->orderByDesc('entry_date')
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
            'category' => ['required', 'in:terapia,sonhos,evento'],
            'type' => ['nullable', 'in:pesadelo,medio,bom,otimo'],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string', 'max:50000'],
            'feedback' => ['nullable', 'string', 'max:50000'],
        ]);

        $entry = $request->user()
            ->journalEntries()
            ->whereDate('entry_date', $data['entry_date'])
            ->where('category', $data['category'])
            ->first();

        if ($entry === null) {
            $entry = $request->user()->journalEntries()->make([
                'entry_date' => $data['entry_date'],
                'category' => $data['category'],
            ]);
        }

        $entry->type = $data['type'] ?? null;
        $entry->title = $data['title'] ?? null;
        $entry->content = $data['content'] ?? '';
        $entry->feedback = $data['feedback'] ?? null;
        $entry->save();

        return response()->json($entry, $entry->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Alterna o estado de fixação da entrada informada.
     *
     * Entradas fixadas são exibidas em destaque no topo da listagem.
     *
     * @param  Request      $request      Requisição com o novo estado de fixação.
     * @param  JournalEntry $journalEntry Entrada cuja fixação será alterada.
     * @return JsonResponse                Entrada atualizada.
     */
    public function togglePin(Request $request, JournalEntry $journalEntry): JsonResponse
    {
        abort_unless($journalEntry->user_id === $request->user()->id, 404);

        $data = $request->validate([
            'pinned' => ['required', 'boolean'],
        ]);

        $journalEntry->pinned = $data['pinned'];
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
