import { useEffect, useMemo, useState } from 'react';
import Calendar from './Calendar';
import EntryList from './EntryList';
import EntryEditor from './EntryEditor';
import CategoryModal from './CategoryModal';
import { deleteEntry, fetchEntries, saveEntry } from '../api/journal';
import { toDateKey } from '../utils/date';

/**
 * Tela principal do Diário.
 *
 * Coordena o calendário, a lista de entradas e o editor, gerenciando o
 * estado da data e da categoria selecionadas e a comunicação com a API
 * para carregar, salvar e excluir os registros.
 *
 * O editor só é exibido após o usuário escolher uma data; quando nenhuma
 * categoria está ativa, um modal pergunta entre Terapia e Sonhos.
 *
 * @returns {JSX.Element} Componente do Diário.
 */
export default function Diary() {
    const [entries, setEntries] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [viewDate, setViewDate] = useState(new Date());
    const [activeCategory, setActiveCategory] = useState(null);
    const [pendingDate, setPendingDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
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

    /** Chave da data atualmente selecionada (ou nulo se o editor está oculto). */
    const selectedKey = selectedDate ? toDateKey(selectedDate) : null;

    /** Entradas visíveis conforme a categoria ativa (todas se nenhuma). */
    const filteredEntries = useMemo(
        () => (activeCategory ? entries.filter((entry) => entry.category === activeCategory) : entries),
        [entries, activeCategory],
    );

    /**
     * Mapa "YYYY-MM-DD" → tema da entrada ("terapia", "sonhos" ou "mixed"
     * quando a data tem as duas categorias). Usado para preencher os dias do
     * calendário com a cor correspondente.
     */
    const entryThemes = useMemo(() => {
        const themes = {};
        filteredEntries.forEach((entry) => {
            const key = entry.entry_date.slice(0, 10);
            if (!themes[key]) {
                themes[key] = entry.category;
            } else if (themes[key] !== entry.category) {
                themes[key] = 'mixed';
            }
        });
        return themes;
    }, [filteredEntries]);

    /** Entrada correspondente à data e categoria selecionadas, se existir. */
    const selectedEntry = useMemo(
        () => entries.find(
            (entry) => entry.entry_date.slice(0, 10) === selectedKey
                && entry.category === activeCategory,
        ) || null,
        [entries, selectedKey, activeCategory],
    );

    // Atualiza o conteúdo do editor sempre que a entrada selecionada muda.
    useEffect(() => {
        const html = selectedEntry?.content || '';
        setContent(html);
        const text = html.replace(/<[^>]*>/g, '');
        setLength(text.length);
    }, [selectedEntry]);

    /**
     * Abre o editor para a data informada na categoria ativa. Se nenhuma
     * categoria estiver selecionada, guarda a data e abre o modal.
     *
     * @param {Date} date - Data escolhida.
     */
    const handleSelectDate = (date) => {
        setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
        if (activeCategory) {
            setSelectedDate(date);
        } else {
            setPendingDate(date);
            setShowModal(true);
        }
    };

    /**
     * Abre o modal de categoria para criar uma nova entrada na data de hoje.
     */
    const handleNewEntry = () => {
        setPendingDate(new Date());
        setShowModal(true);
    };

    /**
     * Define a categoria escolhida no modal e abre o editor na data pendente.
     *
     * @param {string} category - Categoria selecionada ("terapia" ou "sonhos").
     */
    const handleChooseCategory = (category) => {
        const date = pendingDate || new Date();
        setActiveCategory(category);
        setSelectedDate(date);
        setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
        setPendingDate(null);
        setShowModal(false);
    };

    /**
     * Fecha o modal de categoria sem escolher nenhuma opção.
     */
    const handleCloseModal = () => {
        setPendingDate(null);
        setShowModal(false);
    };

    /**
     * Seleciona uma categoria como filtro ativo (lista e calendário).
     *
     * @param {string} category - Categoria a ser filtrada.
     */
    const handleSelectCategory = (category) => {
        setActiveCategory(category);
    };

    /**
     * Limpa o filtro de categoria e oculta o editor (volta ao estado inicial).
     */
    const handleClearCategory = () => {
        setActiveCategory(null);
        setSelectedDate(null);
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
     * Salva (cria ou atualiza) a entrada da data e categoria selecionadas.
     */
    const handleSave = async () => {
        setSaving(true);
        try {
            const saved = await saveEntry(selectedKey, content, activeCategory);
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
     * Exclui a entrada da data e categoria selecionadas, se existir.
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
                    </div>
                    <button
                        type="button"
                        className="diary-save-btn diary__new"
                        onClick={handleNewEntry}
                    >
                        ＋
                    </button>
                </header>

                <div className={`diary__layout ${selectedDate && activeCategory ? '' : 'diary__layout--no-editor'}`}>
                    <div className="diary-panel diary__calendar">
                        <Calendar
                            viewDate={viewDate}
                            selectedDate={selectedDate}
                            entryThemes={entryThemes}
                            activeCategory={activeCategory}
                            onPrev={() => changeMonth(-1)}
                            onNext={() => changeMonth(1)}
                            onSelect={handleSelectDate}
                        />
                    </div>

                    {selectedDate && activeCategory && (
                        <main className="diary__content">
                            <EntryEditor
                                selectedDate={selectedDate}
                                category={activeCategory}
                                content={content}
                                length={length}
                                canDelete={Boolean(selectedEntry)}
                                saving={saving}
                                onChange={handleChange}
                                onSave={handleSave}
                                onDelete={handleDelete}
                            />
                        </main>
                    )}

                    <EntryList
                        entries={filteredEntries}
                        selectedDate={selectedDate}
                        activeCategory={activeCategory}
                        showAll={showAll}
                        onSelect={handleSelectDate}
                        onSelectCategory={handleSelectCategory}
                        onClearCategory={handleClearCategory}
                        onToggleAll={() => setShowAll((open) => !open)}
                    />
                </div>
            </div>

            {showModal && (
                <CategoryModal onChoose={handleChooseCategory} onClose={handleCloseModal} />
            )}
        </div>
    );
}
