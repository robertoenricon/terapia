import RichTextEditor from './RichTextEditor';
import { WEEKDAY_NAMES, formatLongDate } from '../utils/date';
import { CATEGORIES } from '../utils/categories';

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
 * @param {string} props.category - Categoria da entrada ("terapia", "sonhos" ou "evento").
 * @param {string} props.title - Título curto e opcional da entrada.
 * @param {string} props.content - Conteúdo (HTML) atual da entrada.
 * @param {number} props.length - Quantidade de caracteres do texto.
 * @param {boolean} props.canDelete - Indica se a entrada já existe.
 * @param {boolean} props.saving - Indica se o salvamento está em curso.
 * @param {boolean} props.deleting - Indica se a exclusão está em curso.
 * @param {Function} props.onTitleChange - Callback com o novo título.
 * @param {Function} props.onChange - Callback com (html, textLength).
 * @param {Function} props.onSave - Callback ao salvar a entrada.
 * @param {Function} props.onDelete - Callback ao excluir a entrada.
 * @param {Function} props.onBack - Callback para fechar o editor.
 * @returns {JSX.Element} Componente do editor de entrada.
 */
export default function EntryEditor({
    selectedDate,
    category,
    title,
    content,
    length,
    canDelete,
    saving,
    deleting,
    onTitleChange,
    onChange,
    onSave,
    onDelete,
    onBack,
}) {
    const categoryInfo = CATEGORIES[category];

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

            <div className="semear-main__field">
                <label className="semear-main__label" htmlFor="entry-title">Título</label>
                <input
                    id="entry-title"
                    type="text"
                    className="semear-main__title-input"
                    value={title}
                    onChange={(event) => onTitleChange(event.target.value)}
                    placeholder="Dê um título para este registro..."
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
