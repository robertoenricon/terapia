import {
    MONTH_NAMES,
    WEEKDAY_INITIALS,
    buildCalendarDays,
    isSameDay,
    toDateKey,
} from '../utils/date';

/**
 * Calendário mensal do Semear.
 *
 * Exibe os dias do mês, destaca a data selecionada e marca os dias que
 * já possuem entradas registradas. Permite navegar entre os meses e
 * selecionar uma data.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {Date} props.viewDate - Mês atualmente exibido.
 * @param {Date|null} props.selectedDate - Data selecionada pelo usuário.
 * @param {Object} props.entryCategories - Mapa "YYYY-MM-DD" → lista de categorias com registro.
 * @param {string|null} props.activeCategory - Categoria ativa (cor do dia selecionado sem entrada).
 * @param {Function} props.onPrev - Callback para o mês anterior.
 * @param {Function} props.onNext - Callback para o próximo mês.
 * @param {Function} props.onSelect - Callback ao selecionar um dia.
 * @returns {JSX.Element} Componente do calendário.
 */
export default function Calendar({ viewDate, selectedDate, entryCategories, activeCategory, onPrev, onNext, onSelect }) {
    const days = buildCalendarDays(viewDate.getFullYear(), viewDate.getMonth());
    const today = new Date();

    // Ao filtrar por categoria, escurece levemente o calendário para destacar
    // os dias que possuem registros daquela categoria.
    const calendarClasses = [
        'semear-calendar',
        activeCategory ? 'semear-calendar--filtered' : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={calendarClasses}>
            <div className="semear-calendar__header">
                <button type="button" className="semear-icon-btn" onClick={onPrev} aria-label="Mês anterior">
                    ‹
                </button>
                <span className="semear-calendar__title">
                    {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <button type="button" className="semear-icon-btn" onClick={onNext} aria-label="Próximo mês">
                    ›
                </button>
            </div>

            <div className="semear-calendar__grid semear-calendar__weekdays">
                {WEEKDAY_INITIALS.map((initial, index) => (
                    <span key={index} className="semear-calendar__weekday">{initial}</span>
                ))}
            </div>

            <div className="semear-calendar__grid">
                {days.map(({ date, inMonth }) => {
                    const key = toDateKey(date);
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, today);
                    const categories = entryCategories[key] || [];

                    // Todo dia com registro exibe um ponto por categoria abaixo
                    // do número (uma bolinha por registro daquele dia).
                    const hasDots = categories.length > 0;

                    // Com um filtro ativo, mantém em evidência os dias que têm
                    // registros da categoria filtrada (os demais ficam escurecidos).
                    const isHighlighted = activeCategory && categories.includes(activeCategory);

                    // Sem registro, o dia selecionado é preenchido com a cor da
                    // categoria ativa para destacar onde a entrada será criada.
                    let fillTheme = null;
                    if (!hasDots && isSelected) {
                        fillTheme = activeCategory || 'terapia';
                    }

                    const classes = [
                        'semear-calendar__day',
                        inMonth ? '' : 'semear-calendar__day--muted',
                        fillTheme ? `semear-calendar__day--fill-${fillTheme}` : '',
                        isSelected ? 'semear-calendar__day--selected' : '',
                        !fillTheme && isToday ? 'semear-calendar__day--today' : '',
                        isHighlighted ? 'semear-calendar__day--highlight' : '',
                    ].filter(Boolean).join(' ');

                    return (
                        <button
                            type="button"
                            key={key}
                            className={classes}
                            onClick={() => onSelect(date)}
                        >
                            {date.getDate()}
                            {hasDots && (
                                <span className="semear-calendar__dots">
                                    {categories.map((category) => (
                                        <span
                                            key={category}
                                            className={`semear-calendar__dot semear-calendar__dot--${category}`}
                                        />
                                    ))}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
