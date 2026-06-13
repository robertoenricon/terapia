import { useEffect, useState } from 'react';
import {
    MONTH_ABBREVIATIONS,
    WEEKDAY_NAMES,
    fromDateKey,
    isSameDay,
} from '../utils/date';
import { CATEGORIES, CATEGORY_LIST } from '../utils/categories';
import { ENTRY_TYPES, getTypeListByCategory } from '../utils/entryTypes';
import CategoryIcon from './CategoryIcon';

/**
 * Lista as entradas recentes do Semear ("Registros").
 *
 * Exibe os filtros de categoria; ao escolher um, os demais são ocultados e a
 * lista passa a mostrar apenas aquela categoria. Clicar novamente no ícone
 * ativo limpa o filtro e volta a exibir todas as categorias. Quando a categoria
 * ativa possui tipos ("Sonhos" ou "Centro"), também os exibe para refinar o filtro.
 * Cada item mostra o dia, a data e a categoria, permitindo expandir a
 * descrição completa ou abrir a entrada correspondente para alteração.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {Array} props.entries - Entradas do Semear (já filtradas por categoria).
 * @param {Date|null} props.selectedDate - Data atualmente selecionada.
 * @param {string|null} props.activeCategory - Categoria filtrada no momento.
 * @param {boolean} props.showAll - Indica se todas as entradas são exibidas.
 * @param {Function} props.onEdit - Callback ao alterar uma entrada.
 * @param {Function} props.onTogglePin - Callback ao fixar/desafixar uma entrada.
 * @param {Function} props.onToggleStar - Callback ao marcar/desmarcar a estrela de uma entrada.
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
    onTogglePin,
    onToggleStar,
    onSelectCategory,
    onClearCategory,
    onToggleAll,
}) {
    const [expandedEntryId, setExpandedEntryId] = useState(null);
    const [search, setSearch] = useState('');
    const [activeType, setActiveType] = useState(null);
    // Quando ativo, exibe apenas as entradas marcadas com estrela (favoritas).
    const [starredOnly, setStarredOnly] = useState(false);

    // Os tipos pertencem às categorias "Sonhos" e "Centro"; ao trocar de
    // categoria, limpa o filtro de tipo.
    useEffect(() => {
        setActiveType(null);
    }, [activeCategory]);

    // Tipos disponíveis para refinar o filtro da categoria ativa.
    const typeFilterOptions = getTypeListByCategory(activeCategory);

    // Extrai o texto puro de um HTML, descartando as tags de formatação.
    const getPlainText = (html) => {
        const parsed = new DOMParser().parseFromString(html || '', 'text/html');
        return parsed.body.textContent || '';
    };

    // Filtra os registros pelo título, descrição e feedback (sem diferenciar maiúsculas).
    const query = search.trim().toLowerCase();
    const matched = query
        ? entries.filter((entry) => {
            const haystack = [
                entry.title || '',
                getPlainText(entry.content),
                getPlainText(entry.feedback),
            ].join(' ').toLowerCase();
            return haystack.includes(query);
        })
        : entries;
    // Refina por tipo quando "Sonhos" está ativo e um tipo foi selecionado.
    const byType = activeType
        ? matched.filter((entry) => entry.type === activeType)
        : matched;
    // Quando o filtro de estrela está ativo, mantém apenas as entradas favoritas.
    const filtered = starredOnly
        ? byType.filter((entry) => Boolean(entry.starred))
        : byType;
    // Mantém os registros fixados no topo, preservando a ordem de data em cada grupo.
    const ordered = [...filtered].sort(
        (a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)),
    );
    const visible = showAll ? ordered : ordered.slice(0, 3);

    // Sanitiza o HTML do registro preservando a formatação do editor (negrito,
    // itálico, listas, emojis) e removendo conteúdo perigoso, sem limitar o
    // número de caracteres exibidos.
    const sanitizeHtml = (html) => {
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

        return parsed.body.innerHTML;
    };

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
                        placeholder="Buscar por título, descrição ou feedback..."
                        aria-label="Buscar registros por título, descrição ou feedback"
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
                                    'semear-category-chip--icon',
                                    `semear-category-chip--${category.theme}`,
                                    activeCategory === category.value ? 'semear-category-chip--active' : '',
                                ].filter(Boolean).join(' ')}
                                // Alterna o filtro: clicar no ícone ativo limpa, exibindo todas as categorias.
                                onClick={() => (activeCategory === category.value ? onClearCategory() : onSelectCategory(category.value))}
                                aria-label={category.label}
                                aria-pressed={activeCategory === category.value}
                                title={category.label}
                            >
                                <CategoryIcon name={category.value} size={20} />
                            </button>
                        ))}

                    <button
                        type="button"
                        className={[
                            'semear-star-filter',
                            starredOnly ? 'semear-star-filter--active' : '',
                        ].filter(Boolean).join(' ')}
                        // Alterna o filtro de favoritos: exibe apenas entradas com estrela.
                        onClick={() => setStarredOnly((active) => !active)}
                        aria-pressed={starredOnly}
                        aria-label={starredOnly ? 'Mostrar todas as entradas' : 'Mostrar apenas favoritas'}
                        title={starredOnly ? 'Mostrar todas as entradas' : 'Mostrar apenas favoritas'}
                    >
                        ⭐
                    </button>
                </div>

                {typeFilterOptions.length > 0 && (
                    <div className="semear-type-options" role="group" aria-label="Filtrar por tipo">
                        {typeFilterOptions.map((entryType) => (
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
                    {query || activeType || starredOnly
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
                    const isPinned = Boolean(entry.pinned);
                    const isStarred = Boolean(entry.starred);

                    return (
                        <li
                            key={entry.id}
                            className={[
                                'semear-entry-card',
                                isSelected ? 'semear-entry-card--selected' : '',
                                isPinned ? 'semear-entry-card--pinned' : '',
                                isStarred ? 'semear-entry-card--starred' : '',
                            ].filter(Boolean).join(' ')}
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
                                        <span className={`semear-entry-card__weekday${category ? ` semear-entry-card__weekday--${category.theme}` : ''}`}>
                                            {entry.title || WEEKDAY_NAMES[date.getDay()]}
                                            {entryType && (
                                                <span
                                                    className={`semear-entry-type-tag semear-entry-type-tag--${entryType.theme}`}
                                                >
                                                    {` - ${entryType.label}`}
                                                </span>
                                            )}
                                        </span>
                                        {getPlainText(entry.content).trim() ? (
                                            <span
                                                className="semear-entry-card__long"
                                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(entry.content) }}
                                            />
                                        ) : (
                                            <span className="semear-entry-card__long">Sem descrição</span>
                                        )}
                                    </span>
                                    {category && (
                                        <span className={`semear-entry-card__badge semear-entry-card__badge--${category.theme}`}>
                                            {category.label}
                                        </span>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className={[
                                        'semear-entry-card__pin',
                                        `semear-entry-card__pin--${category?.theme || 'terapia'}`,
                                        isPinned ? 'semear-entry-card__pin--active' : '',
                                    ].filter(Boolean).join(' ')}
                                    onClick={() => onTogglePin(entry)}
                                    aria-label={isPinned ? 'Desafixar' : 'Fixar'}
                                    aria-pressed={isPinned}
                                    title={isPinned ? 'Desafixar' : 'Fixar'}
                                >
                                    📌
                                </button>
                                <button
                                    type="button"
                                    className={[
                                        'semear-entry-card__star',
                                        `semear-entry-card__star--${category?.theme || 'terapia'}`,
                                        isStarred ? 'semear-entry-card__star--active' : '',
                                    ].filter(Boolean).join(' ')}
                                    onClick={() => onToggleStar(entry)}
                                    aria-label={isStarred ? 'Remover estrela' : 'Marcar com estrela'}
                                    aria-pressed={isStarred}
                                    title={isStarred ? 'Remover estrela' : 'Marcar com estrela'}
                                >
                                    ⭐
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
