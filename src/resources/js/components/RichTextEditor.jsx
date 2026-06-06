import { useEffect, useRef, useState } from 'react';

/** Conjunto de emojis disponíveis no seletor rápido. */
const EMOJIS = ['😀', '😊', '😍', '🥰', '😌', '😢', '😡', '😴', '🤔', '🙏', '❤️', '✨', '🌱', '☀️', '🌧️', '⭐'];

/**
 * Editor de texto rico simples para os acontecimentos do dia.
 *
 * Oferece formatação básica (negrito, itálico, listas) e inserção de
 * emojis, mantendo a contagem de caracteres do conteúdo digitado.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {string} props.value - Conteúdo em HTML exibido no editor.
 * @param {Function} props.onChange - Callback com (html, textLength).
 * @param {string} props.placeholder - Texto exibido quando vazio.
 * @returns {JSX.Element} Componente do editor de texto rico.
 */
export default function RichTextEditor({ value, onChange, placeholder }) {
    const editorRef = useRef(null);
    const [showEmojis, setShowEmojis] = useState(false);

    // Sincroniza o conteúdo externo sem mover o cursor durante a digitação.
    useEffect(() => {
        const editor = editorRef.current;
        if (editor && editor.innerHTML !== value) {
            editor.innerHTML = value || '';
        }
    }, [value]);

    /**
     * Notifica o componente pai sobre a alteração do conteúdo.
     */
    const emitChange = () => {
        const editor = editorRef.current;
        if (editor) {
            onChange(editor.innerHTML, editor.textContent.length);
        }
    };

    /**
     * Aplica um comando de formatação ao trecho selecionado.
     *
     * @param {string} command - Comando do execCommand.
     */
    const applyCommand = (command) => {
        editorRef.current?.focus();
        document.execCommand(command, false, null);
        emitChange();
    };

    /**
     * Insere o emoji escolhido na posição atual do cursor.
     *
     * @param {string} emoji - Emoji a ser inserido.
     */
    const insertEmoji = (emoji) => {
        editorRef.current?.focus();
        document.execCommand('insertText', false, emoji);
        setShowEmojis(false);
        emitChange();
    };

    return (
        <div className="diary-editor">
            <div className="diary-editor__toolbar">
                <button type="button" className="diary-tool" onClick={() => applyCommand('bold')} aria-label="Negrito">
                    <strong>B</strong>
                </button>
                <button type="button" className="diary-tool" onClick={() => applyCommand('italic')} aria-label="Itálico">
                    <em>I</em>
                </button>
                <span className="diary-tool__divider" />
                <button type="button" className="diary-tool" onClick={() => applyCommand('insertUnorderedList')} aria-label="Lista com marcadores">
                    ☰
                </button>
                <button type="button" className="diary-tool" onClick={() => applyCommand('insertOrderedList')} aria-label="Lista numerada">
                    ⩾
                </button>
                <button type="button" className="diary-tool" onClick={() => applyCommand('indent')} aria-label="Aumentar recuo">
                    ⇥
                </button>
                <span className="diary-tool__divider" />
                <div className="diary-emoji">
                    <button type="button" className="diary-tool" onClick={() => setShowEmojis((open) => !open)} aria-label="Inserir emoji">
                        🙂
                    </button>
                    {showEmojis && (
                        <div className="diary-emoji__panel">
                            {EMOJIS.map((emoji) => (
                                <button
                                    type="button"
                                    key={emoji}
                                    className="diary-emoji__item"
                                    onClick={() => insertEmoji(emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div
                ref={editorRef}
                className="diary-editor__area"
                contentEditable
                role="textbox"
                aria-multiline="true"
                data-placeholder={placeholder}
                onInput={emitChange}
                suppressContentEditableWarning
            />
        </div>
    );
}
