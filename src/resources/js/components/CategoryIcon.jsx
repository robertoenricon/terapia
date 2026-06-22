/**
 * Ícones das categorias do Semear.
 *
 * Cada ícone é um SVG inline que usa "currentColor", herdando a cor
 * definida no chip (cor da categoria ou branco quando ativo/hover).
 */

/**
 * Mapa de desenhos SVG por categoria, indexado pelo valor da categoria.
 *
 * As chaves seguem os valores definidos em utils/categories.js.
 */
const ICONS = {
    // Terapia: cruz médica (símbolo de medicina).
    terapia: (
        <path
            d="M9.6 2 h4.8 a1 1 0 0 1 1 1 v4.6 h4.6 a1 1 0 0 1 1 1 v4.8 a1 1 0 0 1 -1 1 h-4.6 v4.6 a1 1 0 0 1 -1 1 h-4.8 a1 1 0 0 1 -1 -1 v-4.6 h-4.6 a1 1 0 0 1 -1 -1 v-4.8 a1 1 0 0 1 1 -1 h4.6 v-4.6 a1 1 0 0 1 1 -1 z"
            fill="currentColor"
        />
    ),
    // Sonhos: lua crescente com uma estrela.
    sonhos: (
        <>
            <path
                d="M20 15.5 A8 8 0 1 1 11 3.2 A6.3 6.3 0 1 0 20 15.5 Z"
                fill="currentColor"
            />
            <path
                d="M17.5 3 l0.9 2 2 0.9 -2 0.9 -0.9 2 -0.9 -2 -2 -0.9 2 -0.9 z"
                fill="currentColor"
            />
        </>
    ),
    // Evento: calendário.
    evento: (
        <g
            stroke="currentColor"
            strokeWidth="1.7"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
            <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
            <line x1="8" y1="3" x2="8" y2="6.5" />
            <line x1="16" y1="3" x2="16" y2="6.5" />
            <circle cx="12" cy="14.5" r="1.5" fill="currentColor" stroke="none" />
        </g>
    ),
    // Benção: emoji de mãos em oração (gratidão, agradecimento).
    frases: (
        <text
            x="12"
            y="12"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="18"
        >
            🙏
        </text>
    ),
    // Centro: igreja (torre com cruz no topo).
    centro: (
        <g
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" y1="1.8" x2="12" y2="5" />
            <line x1="10.6" y1="3.1" x2="13.4" y2="3.1" />
            <path d="M12 5 L7.5 9.5 H16.5 Z" fill="currentColor" stroke="none" />
            <path d="M8 9.5 V20.5 H16 V9.5" />
            <circle cx="12" cy="12.5" r="1" />
            <path d="M10.3 20.5 V16 a1.7 1.7 0 0 1 3.4 0 V20.5" fill="currentColor" stroke="none" />
        </g>
    ),
};

/**
 * Renderiza o ícone correspondente a uma categoria.
 *
 * @param {Object} props
 * @param {string} props.name - Valor da categoria (ex.: "terapia").
 * @param {number} [props.size=18] - Largura/altura do ícone em pixels.
 * @returns {JSX.Element|null} SVG do ícone ou nulo se a categoria não existir.
 */
function CategoryIcon({ name, size = 18 }) {
    const icon = ICONS[name];

    if (!icon) {
        return null;
    }

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            style={{ display: 'block' }}
        >
            {icon}
        </svg>
    );
}

export default CategoryIcon;
