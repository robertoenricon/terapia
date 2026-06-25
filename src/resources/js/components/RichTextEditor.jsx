import { useCallback, useEffect, useRef, useState } from 'react';

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
 * @param {boolean} [props.showToolbar=true] - Exibe a barra de formatação.
 * @returns {JSX.Element} Componente do editor de texto rico.
 */
export default function RichTextEditor({ value, onChange, placeholder, showToolbar = true }) {
    const editorRef = useRef(null);
    const [showEmojis, setShowEmojis] = useState(false);
    // Rastreia quais formatos estão ativos no trecho selecionado ou na posição do cursor.
    const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false });

    // Sincroniza o conteúdo externo sem mover o cursor durante a digitação.
    useEffect(() => {
        const editor = editorRef.current;
        if (editor && editor.innerHTML !== value) {
            editor.innerHTML = value || '';
        }
    }, [value]);

    /**
     * Atualiza os estados de formatação ativa consultando o documento.
     * Só atualiza quando a seleção está dentro do editor.
     */
    const updateFormatState = useCallback(() => {
        const selection = window.getSelection();
        const editor = editorRef.current;
        if (!editor || !selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        if (!editor.contains(range.commonAncestorContainer)) return;

        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
        });
    }, []);

    // Atualiza o estado de formatação sempre que a seleção muda no documento.
    useEffect(() => {
        document.addEventListener('selectionchange', updateFormatState);
        return () => document.removeEventListener('selectionchange', updateFormatState);
    }, [updateFormatState]);

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
     * Aplica um comando de formatação ao trecho selecionado e
     * atualiza o estado visual dos botões da barra de ferramentas.
     *
     * @param {string} command - Comando do execCommand.
     */
    const applyCommand = (command) => {
        editorRef.current?.focus();
        document.execCommand(command, false, null);
        updateFormatState();
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
        <div className="semear-editor">
            {showToolbar && (
            <div className="semear-editor__toolbar">
                <button
                    type="button"
                    className={`semear-tool${activeFormats.bold ? ' semear-tool--active' : ''}`}
                    onClick={() => applyCommand('bold')}
                    aria-label="Negrito"
                    aria-pressed={activeFormats.bold}
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    className={`semear-tool${activeFormats.italic ? ' semear-tool--active' : ''}`}
                    onClick={() => applyCommand('italic')}
                    aria-label="Itálico"
                    aria-pressed={activeFormats.italic}
                >
                    <em>I</em>
                </button>
                <span className="semear-tool__divider" />
                <button type="button" className="semear-tool" onClick={() => applyCommand('insertUnorderedList')} aria-label="Lista com marcadores">
                    ☰
                </button>
                <span className="semear-tool__divider" />
                <div className="semear-emoji">
                    <button type="button" className="semear-tool" onClick={() => setShowEmojis((open) => !open)} aria-label="Inserir emoji">
                        🙂
                    </button>
                    {showEmojis && (
                        <div className="semear-emoji__panel">
                            {EMOJIS.map((emoji) => (
                                <button
                                    type="button"
                                    key={emoji}
                                    className="semear-emoji__item"
                                    onClick={() => insertEmoji(emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            )}

            <div
                ref={editorRef}
                className="semear-editor__area"
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
