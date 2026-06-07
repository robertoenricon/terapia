import {
    MONTH_ABBREVIATIONS,
    WEEKDAY_NAMES,
    formatLongDate,
    fromDateKey,
    isSameDay,
} from '../utils/date';
import { CATEGORIES, CATEGORY_LIST } from '../utils/categories';

/**
 * Lista as entradas recentes do diário ("Suas entradas").
 *
 * Exibe dois filtros de categoria (Terapia e Sonhos); ao escolher um, o
 * outro é ocultado e a lista passa a mostrar apenas aquela categoria. Cada
 * item mostra o dia, o dia da semana, a data por extenso e um selo da
 * categoria, permitindo selecionar a entrada correspondente.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {Array} props.entries - Entradas do diário (já filtradas por categoria).
 * @param {Date|null} props.selectedDate - Data atualmente selecionada.
 * @param {string|null} props.activeCategory - Categoria filtrada no momento.
 * @param {boolean} props.showAll - Indica se todas as entradas são exibidas.
 * @param {Function} props.onSelect - Callback ao selecionar uma entrada.
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
    onSelect,
    onSelectCategory,
    onClearCategory,
    onToggleAll,
}) {
    const visible = showAll ? entries : entries.slice(0, 3);

    return (
        <div className="diary-panel diary-entries">
            <h2 className="diary-entries__title">Suas entradas</h2>

            <div className="diary-categories">
                {CATEGORY_LIST
                    .filter((category) => !activeCategory || category.value === activeCategory)
                    .map((category) => (
                        <button
                            key={category.value}
                            type="button"
                            className={[
                                'diary-category-chip',
                                `diary-category-chip--${category.theme}`,
                                activeCategory === category.value ? 'diary-category-chip--active' : '',
                            ].filter(Boolean).join(' ')}
                            onClick={() => onSelectCategory(category.value)}
                        >
                            {category.label}
                        </button>
                    ))}

                {activeCategory && (
                    <button type="button" className="diary-category-clear" onClick={onClearCategory}>
                        ← Voltar
                    </button>
                )}
            </div>

            {visible.length === 0 && (
                <p className="diary-entries__empty">Nenhuma entrada registrada ainda.</p>
            )}

            <ul className="diary-entries__list">
                {visible.map((entry) => {
                    const date = fromDateKey(entry.entry_date.slice(0, 10));
                    const isSelected = selectedDate
                        && isSameDay(date, selectedDate)
                        && entry.category === activeCategory;
                    const category = CATEGORIES[entry.category];

                    return (
                        <li key={entry.id}>
                            <button
                                type="button"
                                className={`diary-entry-card ${isSelected ? 'diary-entry-card--selected' : ''}`}
                                onClick={() => onSelect(date)}
                            >
                                <span className="diary-entry-card__date">
                                    <span className={`diary-entry-card__day diary-entry-card__day--${entry.category}`}>
                                        {date.getDate()}
                                    </span>
                                    <span className="diary-entry-card__month">
                                        {MONTH_ABBREVIATIONS[date.getMonth()]}
                                    </span>
                                </span>
                                <span className="diary-entry-card__info">
                                    <span className="diary-entry-card__weekday">
                                        {WEEKDAY_NAMES[date.getDay()]}
                                    </span>
                                    <span className="diary-entry-card__long">{formatLongDate(date)}</span>
                                </span>
                                {category && (
                                    <span className={`diary-entry-card__badge diary-entry-card__badge--${category.theme}`}>
                                        {category.label}
                                    </span>
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>

            {entries.length > 3 && (
                <button type="button" className="diary-entries__toggle" onClick={onToggleAll}>
                    {showAll ? 'Ver menos' : 'Ver todas as entradas'}
                </button>
            )}
        </div>
    );
}
