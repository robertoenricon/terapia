/**
 * Alerta de retorno baseado no componente Alert do Bootstrap.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {'success'|'danger'|'warning'|'info'} props.type - Tipo visual do alerta.
 * @param {string} props.message - Mensagem exibida.
 * @param {Function} props.onClose - Callback para fechar o alerta.
 * @returns {JSX.Element} Alerta Bootstrap.
 */
export default function BootstrapAlert({ type, message, onClose }) {
    return (
        <div
            className={`alert alert-${type} alert-dismissible fade show semear-alert`}
            role="alert"
            aria-live="polite"
        >
            {message}
            <button
                type="button"
                className="btn-close"
                aria-label="Fechar"
                onClick={onClose}
            />
        </div>
    );
}
