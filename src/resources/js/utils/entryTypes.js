/**
 * Tipos das entradas do Semear.
 *
 * Classificam o registro pela sua natureza ("Pesadelo", "Médio", "Bom" ou
 * "Ótimo"). Centraliza o rótulo e a cor de cada tipo para reuso no editor e
 * na listagem dos registros.
 *
 * O campo "theme" é usado como sufixo das classes CSS (ex.: "--pesadelo"),
 * mantendo a cor independente do valor salvo no banco.
 */
export const ENTRY_TYPES = {
    pesadelo: { value: 'pesadelo', label: 'Pesadelo', theme: 'pesadelo' },
    medio: { value: 'medio', label: 'Médio', theme: 'medio' },
    bom: { value: 'bom', label: 'Bom', theme: 'bom' },
    otimo: { value: 'otimo', label: 'Ótimo', theme: 'otimo' },
};

/** Lista ordenada dos tipos para renderização (seletor, etiquetas). */
export const ENTRY_TYPE_LIST = [
    ENTRY_TYPES.pesadelo,
    ENTRY_TYPES.medio,
    ENTRY_TYPES.bom,
    ENTRY_TYPES.otimo,
];
