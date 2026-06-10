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
 * Monta o atributo "d" de uma fatia em formato de anel (rosca) entre dois
 * ângulos, com um raio externo e um interno. O resultado é uma fatia "vazada"
 * no centro, que dá ao gráfico um visual mais moderno e profissional.
 *
 * @param {number} cx - Coordenada X do centro.
 * @param {number} cy - Coordenada Y do centro.
 * @param {number} outerRadius - Raio externo da rosca.
 * @param {number} innerRadius - Raio interno (furo) da rosca.
 * @param {number} startAngle - Ângulo inicial da fatia (graus).
 * @param {number} endAngle - Ângulo final da fatia (graus).
 * @returns {string} Caminho SVG da fatia em anel.
 */
function describeDonutSlice(cx, cy, outerRadius, innerRadius, startAngle, endAngle) {
    const outerStart = polarToCartesian(cx, cy, outerRadius, endAngle);
    const outerEnd = polarToCartesian(cx, cy, outerRadius, startAngle);
    const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
    const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

    return [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerStart.x} ${innerStart.y}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${innerEnd.x} ${innerEnd.y}`,
        'Z',
    ].join(' ');
}

/**
 * Gráfico de rosca (donut) desenhado em SVG puro, sem dependências externas.
 *
 * Recebe uma lista de fatias com rótulo, valor e cor, calcula a porcentagem
 * de cada uma sobre o total e exibe a rosca ao lado de uma legenda com a
 * contagem e o percentual de cada tipo. O centro mostra o total de registros,
 * e fatias com tamanho relevante recebem o percentual diretamente sobre o
 * gráfico. Cada fatia usa exatamente a cor informada pelo tipo.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {Array<{label: string, value: number, color: string}>} props.data - Fatias do gráfico.
 * @param {number} [props.size] - Tamanho (largura/altura) da rosca em pixels.
 * @param {string} [props.unitSingular] - Rótulo central no singular (ex.: "sonho").
 * @param {string} [props.unitPlural] - Rótulo central no plural (ex.: "sonhos").
 * @param {string} [props.ariaLabel] - Descrição acessível do gráfico.
 * @returns {JSX.Element} Componente do gráfico de rosca.
 */
export default function PieChart({
    data,
    size = 260,
    unitSingular = 'sonho',
    unitPlural = 'sonhos',
    ariaLabel = 'Gráfico de rosca com a porcentagem dos tipos de sonhos',
}) {
    const total = data.reduce((sum, slice) => sum + slice.value, 0);
    const center = size / 2;
    // Margem para evitar que a sombra/contorno das fatias seja cortado.
    const outerRadius = center - 6;
    const innerRadius = outerRadius * 0.62;
    // Raio onde os percentuais são posicionados sobre as fatias.
    const labelRadius = (outerRadius + innerRadius) / 2;
    const slices = data.filter((slice) => slice.value > 0);

    let currentAngle = 0;

    return (
        <div className="semear-pie">
            <div className="semear-pie__chart">
                <svg
                    className="semear-pie__svg"
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    role="img"
                    aria-label={ariaLabel}
                >
                    {slices.length === 1 ? (
                        // Uma única fatia ocupa 100%: desenha o anel completo com
                        // dois círculos, pois um arco de 360° não é renderizado.
                        <g className="semear-pie__slice">
                            <circle cx={center} cy={center} r={outerRadius} fill={slices[0].color} />
                            <circle cx={center} cy={center} r={innerRadius} fill="var(--semear-panel-alt)" />
                        </g>
                    ) : (
                        slices.map((slice) => {
                            const sliceAngle = (slice.value / total) * 360;
                            const startAngle = currentAngle;
                            const endAngle = currentAngle + sliceAngle;
                            const path = describeDonutSlice(
                                center,
                                center,
                                outerRadius,
                                innerRadius,
                                startAngle,
                                endAngle,
                            );
                            const percent = Math.round((slice.value / total) * 100);
                            const midAngle = startAngle + sliceAngle / 2;
                            const labelPoint = polarToCartesian(center, center, labelRadius, midAngle);
                            currentAngle = endAngle;

                            return (
                                <g key={slice.label} className="semear-pie__slice">
                                    <path
                                        d={path}
                                        fill={slice.color}
                                        stroke="var(--semear-panel-alt)"
                                        strokeWidth="2.5"
                                        strokeLinejoin="round"
                                    />
                                    {/* Só rotula fatias grandes o bastante para o texto caber. */}
                                    {percent >= 8 && (
                                        <text
                                            className="semear-pie__slice-label"
                                            x={labelPoint.x}
                                            y={labelPoint.y}
                                            textAnchor="middle"
                                            dominantBaseline="central"
                                        >
                                            {percent}%
                                        </text>
                                    )}
                                </g>
                            );
                        })
                    )}

                    {/* Total de registros exibido no centro da rosca. */}
                    <text
                        className="semear-pie__total-value"
                        x={center}
                        y={center - 8}
                        textAnchor="middle"
                        dominantBaseline="central"
                    >
                        {total}
                    </text>
                    <text
                        className="semear-pie__total-label"
                        x={center}
                        y={center + 16}
                        textAnchor="middle"
                        dominantBaseline="central"
                    >
                        {total === 1 ? unitSingular : unitPlural}
                    </text>
                </svg>
            </div>

            <ul className="semear-pie__legend">
                {data.map((slice) => {
                    const percent = total > 0 ? Math.round((slice.value / total) * 100) : 0;

                    return (
                        <li key={slice.label} className="semear-pie__legend-item">
                            <span className="semear-pie__legend-dot" style={{ backgroundColor: slice.color }} />
                            <span className="semear-pie__legend-label">{slice.label}</span>
                            <span className="semear-pie__legend-count">{slice.value}</span>
                            <span className="semear-pie__legend-value">{percent}%</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
