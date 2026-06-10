/**
 * Categorias das entradas do Semear.
 *
 * Centraliza o rótulo e a cor de cada categoria para reuso na lista,
 * no editor, no calendário e no modal de seleção.
 */

/**
 * Mapa das categorias disponíveis, indexado pelo valor salvo no banco.
 *
 * O campo "theme" é usado como sufixo das classes CSS (ex.: "--terapia"),
 * de forma independente do tom de cor escolhido na paleta. O campo "color"
 * aponta para a variável CSS da paleta, garantindo que gráficos e legendas
 * usem exatamente a cor definida para cada categoria.
 */
export const CATEGORIES = {
    terapia: { value: 'terapia', label: 'Terapia', theme: 'terapia', color: 'var(--semear-terapia)' },
    sonhos: { value: 'sonhos', label: 'Sonhos', theme: 'sonhos', color: 'var(--semear-sonhos)' },
    evento: { value: 'evento', label: 'Evento', theme: 'evento', color: 'var(--semear-evento)' },
    centro: { value: 'centro', label: 'Centro', theme: 'centro', color: 'var(--semear-centro)' },
};

/** Lista ordenada das categorias para renderização (chips, modal). */
export const CATEGORY_LIST = [
    CATEGORIES.terapia,
    CATEGORIES.sonhos,
    CATEGORIES.evento,
    CATEGORIES.centro,
];
