import {
    MONTH_ABBREVIATIONS,
    WEEKDAY_NAMES,
    formatLongDate,
    fromDateKey,
    isSameDay,
} from '../utils/date';

/**
 * Lista as entradas recentes do diário ("Suas entradas").
 *
 * Cada item mostra o dia, o dia da semana e a data por extenso,
 * permitindo selecionar a entrada correspondente. Exibe, por padrão,
 * apenas as entradas mais recentes, com opção de ver todas.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {Array} props.entries - Entradas do diário.
 * @param {Date} props.selectedDate - Data atualmente selecionada.
 * @param {boolean} props.showAll - Indica se todas as entradas são exibidas.
 * @param {Function} props.onSelect - Callback ao selecionar uma entrada.
 * @param {Function} props.onToggleAll - Alterna entre ver todas/recentes.
 * @returns {JSX.Element} Componente da lista de entradas.
 */
export default function EntryList({ entries, selectedDate, showAll, onSelect, onToggleAll }) {
    const visible = showAll ? entries : entries.slice(0, 3);

    return (
        <div className="diary-panel diary-entries">
            <h2 className="diary-entries__title">Suas entradas</h2>

            {visible.length === 0 && (
                <p className="diary-entries__empty">Nenhuma entrada registrada ainda.</p>
            )}

            <ul className="diary-entries__list">
                {visible.map((entry) => {
                    const date = fromDateKey(entry.entry_date.slice(0, 10));
                    const isSelected = isSameDay(date, selectedDate);

                    return (
                        <li key={entry.id}>
                            <button
                                type="button"
                                className={`diary-entry-card ${isSelected ? 'diary-entry-card--selected' : ''}`}
                                onClick={() => onSelect(date)}
                            >
                                <span className="diary-entry-card__date">
                                    <span className="diary-entry-card__day">{date.getDate()}</span>
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
                                <span className="diary-entry-card__chevron">›</span>
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
