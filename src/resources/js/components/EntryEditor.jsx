import RichTextEditor from './RichTextEditor';
import { WEEKDAY_NAMES, formatLongDate } from '../utils/date';
import { CATEGORIES } from '../utils/categories';
import { getTypeListByCategory } from '../utils/entryTypes';

/** Limite máximo de caracteres do conteúdo de uma entrada. */
const MAX_LENGTH = 5000;

/**
 * Modal de edição da entrada do dia.
 *
 * Abre sobre a tela após a escolha da data e da categoria. Mostra a data e a
 * categoria selecionadas, permite preencher o título e descrever os
 * acontecimentos com formatação básica, exibe a contagem de caracteres e
 * oferece as ações de salvar e excluir a entrada.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {Date} props.selectedDate - Data selecionada.
 * @param {string} props.category - Categoria da entrada ("terapia", "sonhos", "evento" ou "centro").
 * @param {string|null} props.type - Tipo do registro (tipos de "Sonhos" ou de "Centro").
 * @param {string} props.title - Título curto e opcional da entrada.
 * @param {string} props.content - Conteúdo (HTML) atual da entrada.
 * @param {string} props.feedback - Feedback livre, disponível para todas as categorias.
 * @param {boolean} props.feedbackVisible - Indica se o campo de feedback está visível.
 * @param {number} props.length - Quantidade de caracteres do texto.
 * @param {boolean} props.canDelete - Indica se a entrada já existe.
 * @param {boolean} props.saving - Indica se o salvamento está em curso.
 * @param {boolean} props.deleting - Indica se a exclusão está em curso.
 * @param {Function} props.onTypeChange - Callback com o tipo escolhido (ou nulo).
 * @param {Function} props.onTitleChange - Callback com o novo título.
 * @param {Function} props.onFeedbackChange - Callback com o novo feedback.
 * @param {Function} props.onToggleFeedback - Callback para ocultar ou exibir o feedback.
 * @param {Function} props.onChange - Callback com (html, textLength).
 * @param {Function} props.onSave - Callback ao salvar a entrada.
 * @param {Function} props.onDelete - Callback ao excluir a entrada.
 * @param {Function} props.onBack - Callback para fechar o editor.
 * @returns {JSX.Element} Componente do editor de entrada.
 */
export default function EntryEditor({
    selectedDate,
    category,
    type,
    title,
    content,
    feedback,
    feedbackVisible,
    length,
    canDelete,
    saving,
    deleting,
    onTypeChange,
    onTitleChange,
    onFeedbackChange,
    onToggleFeedback,
    onChange,
    onSave,
    onDelete,
    onBack,
}) {
    const categoryInfo = CATEGORIES[category];
    // Tipos disponíveis para a categoria atual ("Sonhos" e "Centro" possuem tipos).
    const typeOptions = getTypeListByCategory(category);

    return (
        <div className="semear-modal" role="presentation">
            <div
                className="semear-modal__card semear-modal__card--editor semear-main"
                role="dialog"
                aria-modal="true"
                aria-label="Editor de registro"
            >
            <div className="semear-main__header">
                <div className="semear-main__heading">
                    <span className={`semear-main__icon semear-main__icon--${categoryInfo?.theme || 'terapia'}`}>📅</span>
                    <div>
                        <h2 className="semear-main__date">{formatLongDate(selectedDate)}</h2>
                        <p className="semear-main__weekday">{WEEKDAY_NAMES[selectedDate.getDay()]}</p>
                    </div>
                </div>
                <button
                    type="button"
                    className="semear-delete-btn"
                    onClick={onDelete}
                    disabled={!canDelete || saving || deleting}
                    aria-label="Excluir entrada"
                >
                    {deleting ? (
                        <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                    ) : '🗑'}
                </button>
            </div>

            <h3 className={`semear-main__subtitle semear-main__subtitle--${categoryInfo?.theme || 'terapia'}`}>
                {categoryInfo?.label || 'Acontecimentos do dia'}
            </h3>

            {typeOptions.length > 0 && (
                <div className="semear-main__field">
                    <div className="semear-type-options" role="group" aria-label="Tipo do registro">
                        {typeOptions.map((entryType) => (
                            <button
                                key={entryType.value}
                                type="button"
                                className={[
                                    'semear-type-chip',
                                    `semear-type-chip--${entryType.theme}`,
                                    type === entryType.value ? 'semear-type-chip--active' : '',
                                ].filter(Boolean).join(' ')}
                                aria-pressed={type === entryType.value}
                                // Permite alternar: clicar no tipo ativo limpa a seleção.
                                onClick={() => onTypeChange(type === entryType.value ? null : entryType.value)}
                            >
                                {entryType.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="semear-main__field">
                <input
                    id="entry-title"
                    type="text"
                    className="semear-main__title-input"
                    value={title}
                    onChange={(event) => onTitleChange(event.target.value)}
                    placeholder="Dê um título para este registro..."
                    aria-label="Título"
                    maxLength={255}
                />
            </div>

            <RichTextEditor
                value={content}
                onChange={onChange}
                placeholder="Descreva os acontecimentos do seu dia..."
            />

            <div className="semear-main__counter">
                {length}/{MAX_LENGTH} caracteres
            </div>

            <div className="semear-main__field">
                <button
                    type="button"
                    className="semear-main__label semear-main__label--toggle"
                    onClick={onToggleFeedback}
                    aria-expanded={feedbackVisible}
                    aria-controls="entry-feedback"
                >
                    Feedback
                    <span className="semear-main__toggle-icon" aria-hidden="true">
                        {feedbackVisible ? '▲' : '▼'}
                    </span>
                </button>
                {feedbackVisible && (
                    <div id="entry-feedback">
                        <RichTextEditor
                            value={feedback}
                            onChange={(html) => onFeedbackChange(html)}
                            placeholder="Anote suas percepções sobre este registro..."
                            showToolbar={false}
                        />
                    </div>
                )}
            </div>

            <div className="semear-main__actions">
                <button
                    type="button"
                    className="semear-back-btn"
                    onClick={onBack}
                    disabled={saving || deleting}
                >
                    &larr; Voltar
                </button>
                <button
                    type="button"
                    className={`semear-save-btn semear-save-btn--${categoryInfo?.theme || 'terapia'}`}
                    onClick={onSave}
                    disabled={saving || deleting || length > MAX_LENGTH}
                >
                    {saving && (
                        <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                    )}
                    {saving ? 'Salvando...' : 'Salvar registro'}
                </button>
            </div>
            </div>
        </div>
    );
}
