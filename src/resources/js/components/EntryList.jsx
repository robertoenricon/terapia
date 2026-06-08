import { useEffect, useState } from 'react';
import {
    MONTH_ABBREVIATIONS,
    WEEKDAY_NAMES,
    fromDateKey,
    isSameDay,
} from '../utils/date';
import { CATEGORIES, CATEGORY_LIST } from '../utils/categories';
import { ENTRY_TYPES, ENTRY_TYPE_LIST } from '../utils/entryTypes';

// Quantidade máxima de caracteres exibidos na prévia da descrição do registro.
const MAX_PREVIEW_LENGTH = 150;

/**
 * Lista as entradas recentes do Semear ("Registros").
 *
 * Exibe os filtros de categoria; ao escolher um, os demais são ocultados e a
 * lista passa a mostrar apenas aquela categoria. Quando "Sonhos" está ativo,
 * também exibe os tipos (Pesadelo, Médio, Bom e Ótimo) para refinar o filtro.
 * Cada item mostra o dia, a data e a categoria, permitindo expandir a
 * descrição completa ou abrir a entrada correspondente para alteração.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {Array} props.entries - Entradas do Semear (já filtradas por categoria).
 * @param {Date|null} props.selectedDate - Data atualmente selecionada.
 * @param {string|null} props.activeCategory - Categoria filtrada no momento.
 * @param {boolean} props.showAll - Indica se todas as entradas são exibidas.
 * @param {Function} props.onEdit - Callback ao alterar uma entrada.
 * @param {Function} props.onSelectCategory - Callback ao escolher uma categoria.
 * @param {Function} props.onClearCategory - Callback ao limpar o filtro.
 * @param {Function} props.onToggleAll - Alterna entre ver todas/recentes.
 * @returns {JSX.Element} Componente da lista de entradas.
 */
export default function EntryList({
    entries,
    selectedDate,
    activeCategory,
    showAll,
    onEdit,
    onSelectCategory,
    onClearCategory,
    onToggleAll,
}) {
    const [expandedEntryId, setExpandedEntryId] = useState(null);
    const [search, setSearch] = useState('');
    const [activeType, setActiveType] = useState(null);

    // Os tipos pertencem apenas a "Sonhos"; ao trocar de categoria, limpa o filtro.
    useEffect(() => {
        setActiveType(null);
    }, [activeCategory]);

    // Filtra os registros pelo título (busca sem diferenciar maiúsculas).
    const query = search.trim().toLowerCase();
    const matched = query
        ? entries.filter((entry) => (entry.title || '').toLowerCase().includes(query))
        : entries;
    // Refina por tipo quando "Sonhos" está ativo e um tipo foi selecionado.
    const filtered = activeType
        ? matched.filter((entry) => entry.type === activeType)
        : matched;
    const visible = showAll ? filtered : filtered.slice(0, 3);

    const getPlainText = (html) => {
        const parsed = new DOMParser().parseFromString(html || '', 'text/html');
        return parsed.body.textContent || '';
    };

    // Sanitiza o HTML e limita o texto visível ao máximo de caracteres definido,
    // preservando a formatação do editor (negrito, itálico, listas, emojis).
    const sanitizeHtml = (html, limit = MAX_PREVIEW_LENGTH) => {
        const parsed = new DOMParser().parseFromString(html || '', 'text/html');

        // Remove elementos perigosos.
        parsed.body.querySelectorAll('script, style, iframe, object, embed').forEach((node) => node.remove());

        // Remove handlers de evento e URLs com javascript:.
        parsed.body.querySelectorAll('*').forEach((node) => {
            [...node.attributes].forEach((attr) => {
                const name = attr.name.toLowerCase();
                const value = attr.value.replace(/\s+/g, '').toLowerCase();
                if (name.startsWith('on') || ((name === 'href' || name === 'src') && value.startsWith('javascript:'))) {
                    node.removeAttribute(attr.name);
                }
            });
        });

        // Percorre os nós de texto acumulando caracteres até atingir o limite;
        // o excedente é removido e o último trecho recebe reticências.
        const walker = parsed.createTreeWalker(parsed.body, NodeFilter.SHOW_TEXT);
        const overflow = [];
        let remaining = limit;
        let truncated = false;
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (truncated) {
                overflow.push(node);
            } else if (node.textContent.length > remaining) {
                node.textContent = `${node.textContent.slice(0, remaining)}…`;
                truncated = true;
            } else {
                remaining -= node.textContent.length;
            }
        }
        overflow.forEach((node) => node.remove());

        // Remove elementos que ficaram vazios após o corte (ex.: parágrafos finais).
        parsed.body.querySelectorAll('*').forEach((node) => {
            if (!node.textContent.trim() && !node.querySelector('br, img')) {
                node.remove();
            }
        });

        return parsed.body.innerHTML;
    };

    // Limita o texto ao máximo de caracteres definido, acrescentando reticências.
    const truncate = (text, limit = MAX_PREVIEW_LENGTH) => (
        text.length > limit ? `${text.slice(0, limit)}…` : text
    );

    return (
        <div className="semear-panel semear-entries">
            <div className="semear-entries__toolbar">
                <div className="semear-entries__search">
                    <span className="semear-entries__search-icon" aria-hidden="true">🔎</span>
                    <input
                        type="search"
                        className="semear-entries__search-input"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar por título..."
                        aria-label="Buscar registros por título"
                    />
                </div>

                <div className="semear-categories">
                    {CATEGORY_LIST
                        .filter((category) => !activeCategory || category.value === activeCategory)
                        .map((category) => (
                            <button
                                key={category.value}
                                type="button"
                                className={[
                                    'semear-category-chip',
                                    `semear-category-chip--${category.theme}`,
                                    activeCategory === category.value ? 'semear-category-chip--active' : '',
                                ].filter(Boolean).join(' ')}
                                onClick={() => onSelectCategory(category.value)}
                            >
                                {category.label}
                            </button>
                        ))}

                    {activeCategory && (
                        <button type="button" className="semear-category-clear" onClick={onClearCategory}>
                            ← Voltar
                        </button>
                    )}
                </div>

                {activeCategory === 'sonhos' && (
                    <div className="semear-type-options" role="group" aria-label="Filtrar por tipo">
                        {ENTRY_TYPE_LIST.map((entryType) => (
                            <button
                                key={entryType.value}
                                type="button"
                                className={[
                                    'semear-type-chip',
                                    `semear-type-chip--${entryType.theme}`,
                                    activeType === entryType.value ? 'semear-type-chip--active' : '',
                                ].filter(Boolean).join(' ')}
                                aria-pressed={activeType === entryType.value}
                                // Permite alternar: clicar no tipo ativo limpa o filtro.
                                onClick={() => setActiveType(activeType === entryType.value ? null : entryType.value)}
                            >
                                {entryType.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {visible.length === 0 && (
                <p className="semear-entries__empty">
                    {query || activeType
                        ? 'Nenhum registro encontrado para esta busca.'
                        : 'Nenhuma entrada registrada ainda.'}
                </p>
            )}

            <ul className="semear-entries__list">
                {visible.map((entry) => {
                    const date = fromDateKey(entry.entry_date.slice(0, 10));
                    const isSelected = selectedDate
                        && isSameDay(date, selectedDate)
                        && entry.category === activeCategory;
                    const category = CATEGORIES[entry.category];
                    const entryType = ENTRY_TYPES[entry.type];
                    const isExpanded = expandedEntryId === entry.id;

                    return (
                        <li
                            key={entry.id}
                            className={`semear-entry-card ${isSelected ? 'semear-entry-card--selected' : ''}`}
                        >
                            <div className="semear-entry-card__top">
                                <button
                                    type="button"
                                    className="semear-entry-card__summary"
                                    onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                                    aria-expanded={isExpanded}
                                    aria-controls={`entry-description-${entry.id}`}
                                >
                                    <span className="semear-entry-card__date">
                                        <span className={`semear-entry-card__day semear-entry-card__day--${entry.category}`}>
                                            {date.getDate()}
                                        </span>
                                        <span className="semear-entry-card__month">
                                            {MONTH_ABBREVIATIONS[date.getMonth()]}
                                        </span>
                                    </span>
                                    <span className="semear-entry-card__info">
                                        <span className="semear-entry-card__weekday">
                                            {entry.title || WEEKDAY_NAMES[date.getDay()]}
                                            {entryType && (
                                                <span
                                                    className={`semear-entry-type-tag semear-entry-type-tag--${entryType.theme}`}
                                                >
                                                    {entryType.label}
                                                </span>
                                            )}
                                        </span>
                                        <span className="semear-entry-card__long">
                                            {truncate(getPlainText(entry.content)) || 'Sem descrição'}
                                        </span>
                                    </span>
                                    {category && (
                                        <span className={`semear-entry-card__badge semear-entry-card__badge--${category.theme}`}>
                                            {category.label}
                                        </span>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className={`semear-entry-card__edit semear-entry-card__edit--${category?.theme || 'terapia'}`}
                                    onClick={() => onEdit(entry)}
                                    aria-label="Alterar"
                                    title="Alterar"
                                >
                                    ✏️
                                </button>
                            </div>

                            {isExpanded && (
                                getPlainText(entry.content).trim() ? (
                                    <div
                                        id={`entry-description-${entry.id}`}
                                        className="semear-entry-card__description"
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(entry.content) }}
                                    />
                                ) : (
                                    <div
                                        id={`entry-description-${entry.id}`}
                                        className="semear-entry-card__description"
                                    >
                                        Esta entrada não possui descrição.
                                    </div>
                                )
                            )}
                        </li>
                    );
                })}
            </ul>

            {filtered.length > 3 && (
                <button type="button" className="semear-entries__toggle" onClick={onToggleAll}>
                    {showAll ? 'Ver menos' : 'Ver todas as entradas'}
                </button>
            )}
        </div>
    );
}
