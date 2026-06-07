/**
 * Camada de comunicação com a API de entradas do diário.
 *
 * Centraliza as chamadas HTTP para listar, consultar, salvar e remover
 * as entradas, retornando os dados já convertidos de JSON.
 */

/** Prefixo base das rotas da API do diário. */
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
 * Busca todas as entradas do diário.
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
 * @param {string} category - Categoria da entrada ("terapia" ou "sonhos").
 * @returns {Promise<Object>} Entrada salva.
 */
export async function saveEntry(entryDate, content, category) {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        credentials: 'same-origin',
        headers: jsonHeaders(),
        body: JSON.stringify({ entry_date: entryDate, category, content }),
    });
    if (!response.ok) {
        throw new Error('Não foi possível salvar a entrada.');
    }
    return response.json();
}

/**
 * Remove uma entrada do diário pelo seu identificador.
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
