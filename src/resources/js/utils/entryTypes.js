/**
 * Tipos das entradas do Semear.
 *
 * Classificam o registro pela sua natureza. A categoria "Sonhos" usa a escala
 * de humor ("Pesadelo", "Ruim", "Médio", "Bom" ou "Ótimo") e a categoria
 * "Centro" usa os tipos "Umbanda" e "NEMD". Centraliza o rótulo e a cor de
 * cada tipo para reuso no editor e na listagem dos registros.
 *
 * O campo "theme" é usado como sufixo das classes CSS (ex.: "--pesadelo"),
 * mantendo a cor independente do valor salvo no banco. O campo "color"
 * aponta para a mesma variável CSS da paleta, garantindo que gráficos e
 * legendas usem exatamente a cor definida para cada tipo.
 */
export const ENTRY_TYPES = {
    pesadelo: { value: 'pesadelo', label: 'Pesadelo', theme: 'pesadelo', color: 'var(--semear-pesadelo)' },
    ruim: { value: 'ruim', label: 'Ruim', theme: 'ruim', color: 'var(--semear-ruim)' },
    medio: { value: 'medio', label: 'Médio', theme: 'medio', color: 'var(--semear-medio)' },
    bom: { value: 'bom', label: 'Bom', theme: 'bom', color: 'var(--semear-bom)' },
    otimo: { value: 'otimo', label: 'Ótimo', theme: 'otimo', color: 'var(--semear-otimo)' },
    umbanda: { value: 'umbanda', label: 'Umbanda', theme: 'umbanda', color: 'var(--semear-umbanda)' },
    nemd: { value: 'nemd', label: 'NEMD', theme: 'nemd', color: 'var(--semear-nemd)' },
};

/** Tipos da categoria "Sonhos", ordenados do pior ao melhor humor. */
export const ENTRY_TYPE_LIST = [
    ENTRY_TYPES.pesadelo,
    ENTRY_TYPES.ruim,
    ENTRY_TYPES.medio,
    ENTRY_TYPES.bom,
    ENTRY_TYPES.otimo,
];

/** Tipos da categoria "Centro". */
export const CENTRO_TYPE_LIST = [
    ENTRY_TYPES.umbanda,
    ENTRY_TYPES.nemd,
];

/** Mapa das listas de tipos disponíveis por categoria. */
const TYPES_BY_CATEGORY = {
    sonhos: ENTRY_TYPE_LIST,
    centro: CENTRO_TYPE_LIST,
};

/**
 * Retorna a lista de tipos disponível para a categoria informada.
 *
 * @param {string} category - Categoria da entrada (ex.: "sonhos", "centro").
 * @returns {Array} Lista de tipos da categoria, ou vazia se não houver.
 */
export function getTypeListByCategory(category) {
    return TYPES_BY_CATEGORY[category] || [];
}
