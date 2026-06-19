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
     * Retorna as entradas correspondentes à data informada.
     *
     * Uma mesma data pode conter mais de uma entrada, desde que sejam de
     * categorias diferentes (ex.: "terapia" e "sonhos" no mesmo dia). Por
     * isso a consulta devolve uma coleção, e não apenas um registro.
     *
     * @param  string $date Data no formato Y-m-d.
     * @return JsonResponse  Coleção de entradas da data (vazia se não houver).
     */
    public function showByDate(Request $request, string $date): JsonResponse
    {
        $entries = $request->user()
            ->journalEntries()
            ->whereDate('entry_date', $date)
            ->orderBy('category')
            ->get();

        return response()->json($entries);
    }

    /**
     * Cria uma nova entrada para a data e categoria informadas.
     *
     * Cada chamada cria sempre um novo registro, permitindo que uma mesma
     * data possua mais de um registro da mesma categoria.
     *
     * @param  Request $request Requisição com a data e o conteúdo.
     * @return JsonResponse      Entrada criada com status 201.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'entry_date' => ['required', 'date'],
            'category' => ['required', 'in:terapia,sonhos,evento,frases,centro'],
            'type' => ['nullable', 'in:pesadelo,ruim,medio,bom,otimo,umbanda,nemd'],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string', 'max:50000'],
            'feedback' => ['nullable', 'string', 'max:50000'],
        ]);

        $entry = $request->user()->journalEntries()->make([
            'entry_date' => $data['entry_date'],
            'category' => $data['category'],
        ]);

        $entry->type = $data['type'] ?? null;
        $entry->title = $data['title'] ?? null;
        $entry->content = $data['content'] ?? '';
        $entry->feedback = $data['feedback'] ?? null;
        $entry->save();

        return response()->json($entry, 201);
    }

    /**
     * Atualiza a entrada informada (identificada pelo seu id).
     *
     * Usada ao alterar um registro existente já aberto na listagem, sem
     * afetar os demais registros da mesma data e categoria.
     *
     * @param  Request      $request      Requisição com os dados atualizados.
     * @param  JournalEntry $journalEntry Entrada a ser atualizada.
     * @return JsonResponse                Entrada atualizada.
     */
    public function update(Request $request, JournalEntry $journalEntry): JsonResponse
    {
        abort_unless($journalEntry->user_id === $request->user()->id, 404);

        $data = $request->validate([
            'type' => ['nullable', 'in:pesadelo,ruim,medio,bom,otimo,umbanda,nemd'],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string', 'max:50000'],
            'feedback' => ['nullable', 'string', 'max:50000'],
        ]);

        $journalEntry->type = $data['type'] ?? null;
        $journalEntry->title = $data['title'] ?? null;
        $journalEntry->content = $data['content'] ?? '';
        $journalEntry->feedback = $data['feedback'] ?? null;
        $journalEntry->save();

        return response()->json($journalEntry);
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
     * Alterna o estado de estrela (favorito) da entrada informada.
     *
     * Entradas com estrela são marcadas como favoritas e podem ser
     * filtradas na listagem.
     *
     * @param  Request      $request      Requisição com o novo estado de estrela.
     * @param  JournalEntry $journalEntry Entrada cuja estrela será alterada.
     * @return JsonResponse                Entrada atualizada.
     */
    public function toggleStar(Request $request, JournalEntry $journalEntry): JsonResponse
    {
        abort_unless($journalEntry->user_id === $request->user()->id, 404);

        $data = $request->validate([
            'starred' => ['required', 'boolean'],
        ]);

        $journalEntry->starred = $data['starred'];
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
