import { useEffect, useMemo, useState } from 'react';
import Calendar from './Calendar';
import EntryList from './EntryList';
import EntryEditor from './EntryEditor';
import { deleteEntry, fetchEntries, saveEntry } from '../api/journal';
import { toDateKey } from '../utils/date';

/**
 * Tela principal do Diário.
 *
 * Coordena o calendário, a lista de entradas e o editor, gerenciando o
 * estado da data selecionada e a comunicação com a API para carregar,
 * salvar e excluir os registros do dia.
 *
 * @returns {JSX.Element} Componente do Diário.
 */
export default function Diary() {
    const [entries, setEntries] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date());
    const [content, setContent] = useState('');
    const [length, setLength] = useState(0);
    const [saving, setSaving] = useState(false);
    const [showAll, setShowAll] = useState(false);

    // Carrega as entradas existentes ao montar o componente.
    useEffect(() => {
        fetchEntries()
            .then(setEntries)
            .catch(() => setEntries([]));
    }, []);

    /** Chave da data atualmente selecionada. */
    const selectedKey = toDateKey(selectedDate);

    /** Conjunto com as datas que já possuem entradas. */
    const entryDates = useMemo(
        () => new Set(entries.map((entry) => entry.entry_date.slice(0, 10))),
        [entries],
    );

    /** Entrada correspondente à data selecionada, se existir. */
    const selectedEntry = useMemo(
        () => entries.find((entry) => entry.entry_date.slice(0, 10) === selectedKey) || null,
        [entries, selectedKey],
    );

    // Atualiza o conteúdo do editor sempre que a data selecionada muda.
    useEffect(() => {
        const html = selectedEntry?.content || '';
        setContent(html);
        const text = html.replace(/<[^>]*>/g, '');
        setLength(text.length);
    }, [selectedEntry]);

    /**
     * Seleciona uma data e ajusta o mês exibido no calendário.
     *
     * @param {Date} date - Data escolhida.
     */
    const handleSelectDate = (date) => {
        setSelectedDate(date);
        setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
    };

    /**
     * Avança ou retrocede o mês exibido no calendário.
     *
     * @param {number} offset - Deslocamento de meses (-1 ou +1).
     */
    const changeMonth = (offset) => {
        setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
    };

    /**
     * Atualiza o conteúdo e a contagem de caracteres do editor.
     *
     * @param {string} html - Conteúdo em HTML.
     * @param {number} textLength - Quantidade de caracteres do texto.
     */
    const handleChange = (html, textLength) => {
        setContent(html);
        setLength(textLength);
    };

    /**
     * Salva (cria ou atualiza) a entrada da data selecionada.
     */
    const handleSave = async () => {
        setSaving(true);
        try {
            const saved = await saveEntry(selectedKey, content);
            setEntries((current) => {
                const others = current.filter((entry) => entry.id !== saved.id);
                return [saved, ...others].sort((a, b) => b.entry_date.localeCompare(a.entry_date));
            });
        } catch (error) {
            window.alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    /**
     * Exclui a entrada da data selecionada, se existir.
     */
    const handleDelete = async () => {
        if (!selectedEntry || !window.confirm('Deseja realmente excluir esta entrada?')) {
            return;
        }
        try {
            await deleteEntry(selectedEntry.id);
            setEntries((current) => current.filter((entry) => entry.id !== selectedEntry.id));
            setContent('');
            setLength(0);
        } catch (error) {
            window.alert(error.message);
        }
    };

    return (
        <div className="diary">
            <div className="diary__container">
                <header className="diary__header">
                    <div>
                        <h1 className="diary__title">
                            <span className="diary__logo">🌱</span> Diário
                        </h1>
                        <p className="diary__subtitle">
                            Registre seus pensamentos, sentimentos e acontecimentos.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="diary-save-btn diary__new"
                        onClick={() => handleSelectDate(new Date())}
                    >
                        ＋ Nova Data
                    </button>
                </header>

                <div className="diary__layout">
                    <aside className="diary__sidebar">
                        <div className="diary-panel">
                            <Calendar
                                viewDate={viewDate}
                                selectedDate={selectedDate}
                                entryDates={entryDates}
                                onPrev={() => changeMonth(-1)}
                                onNext={() => changeMonth(1)}
                                onSelect={handleSelectDate}
                            />
                        </div>

                        <EntryList
                            entries={entries}
                            selectedDate={selectedDate}
                            showAll={showAll}
                            onSelect={handleSelectDate}
                            onToggleAll={() => setShowAll((open) => !open)}
                        />
                    </aside>

                    <main className="diary__content">
                        <EntryEditor
                            selectedDate={selectedDate}
                            content={content}
                            length={length}
                            canDelete={Boolean(selectedEntry)}
                            saving={saving}
                            onChange={handleChange}
                            onSave={handleSave}
                            onDelete={handleDelete}
                        />
                    </main>
                </div>
            </div>
        </div>
    );
}
