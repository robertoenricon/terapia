import { useEffect, useRef } from 'react';

/**
 * Alerta de retorno baseado no componente Alert do Bootstrap.
 *
 * O alerta se fecha sozinho apos alguns segundos (auto-dismiss), mas tambem
 * pode ser fechado manualmente pelo botao de fechar.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {'success'|'danger'|'warning'|'info'} props.type - Tipo visual do alerta.
 * @param {string} props.message - Mensagem exibida.
 * @param {Function} props.onClose - Callback para fechar o alerta.
 * @param {number} [props.autoCloseMs=3000] - Tempo (ms) ate o fechamento automatico.
 * @returns {JSX.Element} Alerta Bootstrap.
 */
export default function BootstrapAlert({ type, message, onClose, autoCloseMs = 3000 }) {
    // Mantem a referencia atual do onClose sem reiniciar o timer a cada render
    // (o pai costuma passar uma arrow inline, que muda de referencia sempre).
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    // Fecha o alerta automaticamente apos o tempo definido. O timer so reinicia
    // quando a mensagem muda, nao em re-renders nao relacionados.
    useEffect(() => {
        if (!autoCloseMs) {
            return undefined;
        }

        const timer = setTimeout(() => onCloseRef.current(), autoCloseMs);

        // Limpa o temporizador se o alerta for desmontado ou trocar de mensagem.
        return () => clearTimeout(timer);
    }, [autoCloseMs, message]);

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
