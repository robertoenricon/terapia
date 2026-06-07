/**
 * Categorias das entradas do diário.
 *
 * Centraliza o rótulo e a cor de cada categoria para reuso na lista,
 * no editor, no calendário e no modal de seleção.
 */

/** Mapa das categorias disponíveis, indexado pelo valor salvo no banco. */
export const CATEGORIES = {
    terapia: { value: 'terapia', label: 'Terapia', color: 'green' },
    sonhos: { value: 'sonhos', label: 'Sonhos', color: 'blue' },
};

/** Lista ordenada das categorias para renderização (chips, modal). */
export const CATEGORY_LIST = [CATEGORIES.terapia, CATEGORIES.sonhos];
