/**
 * Camada de comunicação com a API de entradas do Semear.
 *
 * Centraliza as chamadas HTTP para listar, consultar, salvar e remover
 * as entradas, retornando os dados já convertidos de JSON.
 */

/** Prefixo base das rotas da API do Semear. */
const BASE_URL = '/api/journal-entries';

/**
 * Cabeçalhos padrão enviados nas requisições JSON.
 *
 * @returns {Object} Mapa de cabeçalhos HTTP.
 */
function jsonHeaders() {
    return {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
    };
}

/**
 * Busca todas as entradas do Semear.
 *
 * @returns {Promise<Array>} Lista de entradas registradas.
 */
export async function fetchEntries() {
    const response = await fetch(BASE_URL, {
        credentials: 'same-origin',
        headers: jsonHeaders(),
    });
    if (!response.ok) {
        throw new Error('Não foi possível carregar as entradas.');
    }
    return response.json();
}

/**
 * Cria ou atualiza a entrada de uma data e categoria.
 *
 * @param {string} entryDate - Data no formato "YYYY-MM-DD".
 * @param {string} content - Conteúdo (HTML) dos acontecimentos do dia.
 * @param {string} category - Categoria da entrada ("terapia", "sonhos", "evento" ou "centro").
 * @param {string|null} type - Tipo do registro ("pesadelo", "medio", "bom" ou "otimo").
 * @param {string} title - Título curto e opcional da entrada.
 * @param {string|null} feedback - Feedback livre, exclusivo da categoria "sonhos".
 * @returns {Promise<Object>} Entrada salva.
 */
export async function saveEntry(entryDate, content, category, type, title, feedback) {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        credentials: 'same-origin',
        headers: jsonHeaders(),
        body: JSON.stringify({ entry_date: entryDate, category, type, title, content, feedback }),
    });
    if (!response.ok) {
        throw new Error('Não foi possível salvar a entrada.');
    }
    return response.json();
}

/**
 * Alterna a fixação de uma entrada do Semear.
 *
 * Entradas fixadas são destacadas e exibidas no topo da listagem.
 *
 * @param {number} id - Identificador da entrada.
 * @param {boolean} pinned - Novo estado de fixação desejado.
 * @returns {Promise<Object>} Entrada atualizada.
 */
export async function togglePin(id, pinned) {
    const response = await fetch(`${BASE_URL}/${id}/pin`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: jsonHeaders(),
        body: JSON.stringify({ pinned }),
    });
    if (!response.ok) {
        throw new Error('Não foi possível fixar a entrada.');
    }
    return response.json();
}

/**
 * Alterna a estrela (favorito) de uma entrada do Semear.
 *
 * Entradas com estrela são marcadas como favoritas e podem ser filtradas
 * na listagem.
 *
 * @param {number} id - Identificador da entrada.
 * @param {boolean} starred - Novo estado de estrela desejado.
 * @returns {Promise<Object>} Entrada atualizada.
 */
export async function toggleStar(id, starred) {
    const response = await fetch(`${BASE_URL}/${id}/star`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: jsonHeaders(),
        body: JSON.stringify({ starred }),
    });
    if (!response.ok) {
        throw new Error('Não foi possível marcar a estrela da entrada.');
    }
    return response.json();
}

/**
 * Remove uma entrada do Semear pelo seu identificador.
 *
 * @param {number} id - Identificador da entrada.
 * @returns {Promise<void>} Resolve quando a remoção é concluída.
 */
export async function deleteEntry(id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: jsonHeaders(),
    });
    if (!response.ok) {
        throw new Error('Não foi possível excluir a entrada.');
    }
}
