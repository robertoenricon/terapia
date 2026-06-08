import { useState } from 'react';
import {
    MONTH_ABBREVIATIONS,
    WEEKDAY_NAMES,
    fromDateKey,
    isSameDay,
} from '../utils/date';
import { CATEGORIES, CATEGORY_LIST } from '../utils/categories';

// Quantidade máxima de caracteres exibidos na prévia da descrição do registro.
const MAX_PREVIEW_LENGTH = 50;

/**
 * Lista as entradas recentes do Semear ("Registros").
 *
 * Exibe dois filtros de categoria (Terapia e Sonhos); ao escolher um, o
 * outro é ocultado e a lista passa a mostrar apenas aquela categoria. Cada
 * item mostra o dia, a data e a categoria, permitindo expandir a descrição
 * completa ou abrir a entrada correspondente para alteração.
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

    // Filtra os registros pelo título (busca sem diferenciar maiúsculas).
    const query = search.trim().toLowerCase();
    const matched = query
        ? entries.filter((entry) => (entry.title || '').toLowerCase().includes(query))
        : entries;
    const visible = showAll ? matched : matched.slice(0, 3);

    const getPlainText = (html) => {
        const parsed = new DOMParser().parseFromString(html || '', 'text/html');
        return parsed.body.textContent || '';
    };

    // Limita o texto ao máximo de caracteres definido, acrescentando reticências.
    const truncate = (text, limit = MAX_PREVIEW_LENGTH) => (
        text.length > limit ? `${text.slice(0, limit)}…` : text
    );

    return (
        <div className="semear-panel semear-entries">
            <h2 className="semear-entries__title">Registros</h2>

            <div className="semear-entries__toolbar">
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
            </div>

            {visible.length === 0 && (
                <p className="semear-entries__empty">
                    {query
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
                                <div
                                    id={`entry-description-${entry.id}`}
                                    className="semear-entry-card__description"
                                >
                                    {getPlainText(entry.content) || 'Esta entrada não possui descrição.'}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

            {matched.length > 3 && (
                <button type="button" className="semear-entries__toggle" onClick={onToggleAll}>
                    {showAll ? 'Ver menos' : 'Ver todas as entradas'}
                </button>
            )}
        </div>
    );
}
