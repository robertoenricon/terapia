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
 * Cria uma nova entrada para uma data e categoria.
 *
 * Permite vários registros na mesma data e categoria (ex.: dois eventos
 * no mesmo dia); cada chamada cria um registro independente.
 *
 * @param {string} entryDate - Data no formato "YYYY-MM-DD".
 * @param {string} content - Conteúdo (HTML) dos acontecimentos do dia.
 * @param {string} category - Categoria da entrada ("terapia", "sonhos" ou "evento").
 * @returns {Promise<Object>} Entrada criada.
 */
export async function createEntry(entryDate, content, category) {
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
 * Atualiza o conteúdo de uma entrada existente.
 *
 * @param {number} id - Identificador da entrada.
 * @param {string} content - Novo conteúdo (HTML) da entrada.
 * @returns {Promise<Object>} Entrada atualizada.
 */
export async function updateEntry(id, content) {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: jsonHeaders(),
        body: JSON.stringify({ content }),
    });
    if (!response.ok) {
        throw new Error('Não foi possível salvar a entrada.');
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
