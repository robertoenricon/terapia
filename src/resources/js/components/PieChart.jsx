/**
 * Converte um ângulo (em graus) em coordenadas cartesianas sobre a
 * circunferência, com 0° apontando para o topo e crescendo no sentido horário.
 *
 * @param {number} cx - Coordenada X do centro.
 * @param {number} cy - Coordenada Y do centro.
 * @param {number} radius - Raio da circunferência.
 * @param {number} angle - Ângulo em graus.
 * @returns {{x: number, y: number}} Ponto correspondente na circunferência.
 */
function polarToCartesian(cx, cy, radius, angle) {
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
        x: cx + radius * Math.cos(radians),
        y: cy + radius * Math.sin(radians),
    };
}

/**
 * Monta o atributo "d" de uma fatia da pizza entre dois ângulos.
 *
 * @param {number} cx - Coordenada X do centro.
 * @param {number} cy - Coordenada Y do centro.
 * @param {number} radius - Raio da pizza.
 * @param {number} startAngle - Ângulo inicial da fatia (graus).
 * @param {number} endAngle - Ângulo final da fatia (graus).
 * @returns {string} Caminho SVG da fatia.
 */
function describeSlice(cx, cy, radius, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

    return [
        `M ${cx} ${cy}`,
        `L ${start.x} ${start.y}`,
        `A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`,
        'Z',
    ].join(' ');
}

/**
 * Gráfico de pizza desenhado em SVG puro, sem dependências externas.
 *
 * Recebe uma lista de fatias com rótulo, valor e cor, calcula a porcentagem
 * de cada uma sobre o total e exibe a pizza ao lado de uma legenda com os
 * percentuais. Cada fatia usa exatamente a cor informada pelo tipo.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {Array<{label: string, value: number, color: string}>} props.data - Fatias do gráfico.
 * @param {number} [props.size] - Tamanho (largura/altura) da pizza em pixels.
 * @returns {JSX.Element} Componente do gráfico de pizza.
 */
export default function PieChart({ data, size = 240 }) {
    const total = data.reduce((sum, slice) => sum + slice.value, 0);
    const radius = size / 2;
    const slices = data.filter((slice) => slice.value > 0);

    let currentAngle = 0;

    return (
        <div className="semear-pie">
            <svg
                className="semear-pie__svg"
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                role="img"
                aria-label="Gráfico de pizza com a porcentagem dos tipos de sonhos"
            >
                {slices.length === 1 ? (
                    // Uma única fatia ocupa 100%: desenha o círculo completo,
                    // pois um arco de 360° não é renderizado corretamente.
                    <circle cx={radius} cy={radius} r={radius} fill={slices[0].color} />
                ) : (
                    slices.map((slice) => {
                        const sliceAngle = (slice.value / total) * 360;
                        const path = describeSlice(radius, radius, radius, currentAngle, currentAngle + sliceAngle);
                        currentAngle += sliceAngle;

                        return <path key={slice.label} d={path} fill={slice.color} />;
                    })
                )}
            </svg>

            <ul className="semear-pie__legend">
                {data.map((slice) => {
                    const percent = total > 0 ? Math.round((slice.value / total) * 100) : 0;

                    return (
                        <li key={slice.label} className="semear-pie__legend-item">
                            <span className="semear-pie__legend-dot" style={{ backgroundColor: slice.color }} />
                            <span className="semear-pie__legend-label">{slice.label}</span>
                            <span className="semear-pie__legend-value">{percent}%</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
