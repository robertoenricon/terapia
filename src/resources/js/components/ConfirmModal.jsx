/**
 * Modal de confirmação para ações sensíveis (ex.: exclusão de uma entrada).
 *
 * Exibe uma sobreposição com a pergunta e dois botões: cancelar e confirmar.
 * Ao confirmar ou cancelar, informa o componente pai. Clicar fora ou no botão
 * de fechar equivale a cancelar a ação.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {string} props.title - Título exibido no cabeçalho do modal.
 * @param {string} props.message - Texto da pergunta de confirmação.
 * @param {string} [props.confirmLabel] - Rótulo do botão de confirmação.
 * @param {string} [props.cancelLabel] - Rótulo do botão de cancelamento.
 * @param {boolean} [props.loading] - Indica que a ação está em andamento.
 * @param {Function} props.onConfirm - Callback ao confirmar a ação.
 * @param {Function} props.onCancel - Callback ao cancelar a ação.
 * @returns {JSX.Element} Componente do modal de confirmação.
 */
export default function ConfirmModal({
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    loading = false,
    onConfirm,
    onCancel,
}) {
    return (
        <div className="diary-modal" onClick={loading ? undefined : onCancel}>
            <div
                className="diary-modal__card"
                role="alertdialog"
                aria-modal="true"
                aria-label={title}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="diary-modal__header">
                    <h2 className="diary-modal__title">{title}</h2>
                    <button
                        type="button"
                        className="diary-icon-btn"
                        onClick={onCancel}
                        disabled={loading}
                        aria-label="Fechar"
                    >
                        ✕
                    </button>
                </div>

                <p className="diary-modal__text">{message}</p>

                <div className="diary-modal__actions">
                    <button
                        type="button"
                        className="diary-back-btn"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className="diary-modal__confirm"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading && (
                            <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                        )}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
