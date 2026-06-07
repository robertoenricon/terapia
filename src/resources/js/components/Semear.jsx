import { useEffect, useMemo, useState } from 'react';
import Calendar from './Calendar';
import EntryList from './EntryList';
import EntryEditor from './EntryEditor';
import CategoryModal from './CategoryModal';
import DayEntriesModal from './DayEntriesModal';
import ConfirmModal from './ConfirmModal';
import BootstrapAlert from './BootstrapAlert';
import { createEntry, deleteEntry, fetchEntries, updateEntry } from '../api/journal';
import { logout } from '../api/auth';
import { fromDateKey, toDateKey } from '../utils/date';

/**
 * Tela principal do Semear.
 *
 * Coordena o calendário, a lista de entradas e o editor, gerenciando o
 * estado da data e da categoria selecionadas e a comunicação com a API
 * para carregar, salvar e excluir os registros.
 *
 * O editor só é exibido após o usuário escolher uma data; quando nenhuma
 * categoria está ativa, um modal pergunta a categoria. Uma mesma data pode
 * ter vários registros da mesma categoria (ex.: dois eventos no mesmo dia).
 *
 * @returns {JSX.Element} Componente do Semear.
 */
export default function Semear({ userName }) {
    const [entries, setEntries] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEntryId, setSelectedEntryId] = useState(null);
    const [viewDate, setViewDate] = useState(new Date());
    const [activeCategory, setActiveCategory] = useState(null);
    const [pendingDate, setPendingDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [dayModalDate, setDayModalDate] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [content, setContent] = useState('');
    const [length, setLength] = useState(0);
    const [loadingEntries, setLoadingEntries] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [alert, setAlert] = useState(null);

    // Carrega as entradas existentes ao montar o componente.
    useEffect(() => {
        fetchEntries()
            .then(setEntries)
            .catch((error) => {
                setEntries([]);
                setAlert({
                    type: 'danger',
                    message: error.message,
                });
            })
            .finally(() => setLoadingEntries(false));
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

    /** Entrada atualmente em edição (nula quando é um novo registro). */
    const selectedEntry = useMemo(
        () => (selectedEntryId
            ? entries.find((entry) => entry.id === selectedEntryId) || null
            : null),
        [entries, selectedEntryId],
    );

    // Atualiza o conteúdo do editor sempre que a entrada selecionada muda.
    useEffect(() => {
        const html = selectedEntry?.content || '';
        setContent(html);
        const text = html.replace(/<[^>]*>/g, '');
        setLength(text.length);
    }, [selectedEntry]);

    /**
     * Abre o editor de um novo registro quando a data ainda não tem
     * registros da categoria; caso já existam, exibe o modal com a lista
     * para escolher qual alterar ou adicionar um novo.
     *
     * @param {Date} date - Data escolhida.
     * @param {string} category - Categoria ativa.
     */
    const openDayOrEditor = (date, category) => {
        const key = toDateKey(date);
        const dayEntries = entries.filter(
            (entry) => entry.entry_date.slice(0, 10) === key && entry.category === category,
        );
        if (dayEntries.length === 0) {
            setSelectedEntryId(null);
            setSelectedDate(date);
        } else {
            setDayModalDate(date);
        }
    };

    /**
     * Trata o clique em uma data do calendário. Se nenhuma categoria
     * estiver selecionada, guarda a data e abre o modal de categorias.
     *
     * @param {Date} date - Data escolhida.
     */
    const handleSelectDate = (date) => {
        setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
        if (activeCategory) {
            openDayOrEditor(date, activeCategory);
        } else {
            setPendingDate(date);
            setShowModal(true);
        }
    };

    /**
     * Define a categoria escolhida no modal e segue para o editor (ou para
     * a lista de registros, caso a data já tenha registros) na data pendente.
     *
     * @param {string} category - Categoria selecionada ("terapia", "sonhos" ou "evento").
     */
    const handleChooseCategory = (category) => {
        const date = pendingDate || new Date();
        setActiveCategory(category);
        setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
        setPendingDate(null);
        setShowModal(false);
        openDayOrEditor(date, category);
    };

    /**
     * Abre o editor para alterar o registro escolhido no modal do dia.
     *
     * @param {Object} entry - Registro selecionado para alteração.
     */
    const handleEditDayEntry = (entry) => {
        setSelectedEntryId(entry.id);
        setSelectedDate(dayModalDate);
        setDayModalDate(null);
    };

    /**
     * Abre o editor de um novo registro a partir do modal do dia.
     */
    const handleNewDayEntry = () => {
        setSelectedEntryId(null);
        setSelectedDate(dayModalDate);
        setDayModalDate(null);
    };

    /**
     * Fecha o modal de registros do dia sem escolher nenhuma opção.
     */
    const handleCloseDayModal = () => {
        setDayModalDate(null);
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

    const handleCloseEditor = () => {
        setSelectedDate(null);
        setSelectedEntryId(null);
    };

    /**
     * Abre no editor a entrada escolhida na lista.
     *
     * @param {Object} entry - Entrada que será alterada.
     */
    const handleEditEntry = (entry) => {
        const date = fromDateKey(entry.entry_date.slice(0, 10));
        setActiveCategory(entry.category);
        setSelectedEntryId(entry.id);
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
     * Salva o registro em edição: cria um novo quando não há registro
     * selecionado ou atualiza o conteúdo do registro existente.
     */
    const handleSave = async () => {
        const isEditing = Boolean(selectedEntryId);
        setSaving(true);
        setAlert(null);
        try {
            const saved = isEditing
                ? await updateEntry(selectedEntryId, content)
                : await createEntry(selectedKey, content, activeCategory);
            setEntries((current) => {
                const others = current.filter((entry) => entry.id !== saved.id);
                return [saved, ...others].sort(
                    (a, b) => b.entry_date.localeCompare(a.entry_date) || b.id - a.id,
                );
            });
            setSelectedEntryId(saved.id);
            setAlert({
                type: 'success',
                message: isEditing
                    ? 'Registro alterado com sucesso.'
                    : 'Registro salvo com sucesso.',
            });
        } catch (error) {
            setAlert({
                type: 'danger',
                message: isEditing
                    ? `Não foi possível alterar o registro. ${error.message}`
                    : error.message,
            });
        } finally {
            setSaving(false);
        }
    };

    /**
     * Abre o modal de confirmação de exclusão, se houver entrada selecionada.
     */
    const handleRequestDelete = () => {
        if (!selectedEntry) {
            return;
        }
        setShowDeleteModal(true);
    };

    /**
     * Fecha o modal de confirmação de exclusão sem excluir nada.
     */
    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };

    /**
     * Exclui a entrada da data e categoria selecionadas após confirmação.
     */
    const handleConfirmDelete = async () => {
        if (!selectedEntry) {
            setShowDeleteModal(false);
            return;
        }
        setDeleting(true);
        setAlert(null);
        try {
            await deleteEntry(selectedEntry.id);
            setEntries((current) => current.filter((entry) => entry.id !== selectedEntry.id));
            setContent('');
            setLength(0);
            setSelectedEntryId(null);
            setSelectedDate(null);
            setShowDeleteModal(false);
            setAlert({
                type: 'success',
                message: 'Registro excluído com sucesso.',
            });
        } catch (error) {
            setAlert({
                type: 'danger',
                message: error.message,
            });
        } finally {
            setDeleting(false);
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        setAlert(null);

        try {
            await logout();
            window.location.assign('/login');
        } catch (error) {
            setAlert({
                type: 'danger',
                message: error.message,
            });
            setLoggingOut(false);
        }
    };

    return (
        <div className="semear">
            <div className="semear__container">
                <header className="semear__header">
                    <div>
                        <h1 className="semear__title">
                            <span className="semear__logo">🌱</span> Semear
                        </h1>
                    </div>
                    <div className="semear-user">
                        <span className="semear-user__name">{userName}</span>
                        <button
                            type="button"
                            className="semear-logout-btn"
                            onClick={handleLogout}
                            disabled={loggingOut}
                        >
                            {loggingOut && (
                                <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                            )}
                            {loggingOut ? 'Saindo...' : 'Sair'}
                        </button>
                    </div>
                </header>

                {alert && (
                    <BootstrapAlert
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

                {loadingEntries ? (
                    <div className="semear-panel semear-loading" role="status" aria-live="polite">
                        <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                        <span>Carregando entradas...</span>
                    </div>
                ) : (
                    <div className={`semear__layout ${selectedDate && activeCategory ? '' : 'semear__layout--no-editor'}`}>
                        <div className="semear-panel semear__calendar">
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
                            <main className="semear__content">
                                <EntryEditor
                                    selectedDate={selectedDate}
                                    category={activeCategory}
                                    content={content}
                                    length={length}
                                    canDelete={Boolean(selectedEntry)}
                                    saving={saving}
                                    deleting={deleting}
                                    onChange={handleChange}
                                    onSave={handleSave}
                                    onDelete={handleRequestDelete}
                                    onBack={handleCloseEditor}
                                />
                            </main>
                        )}

                        <EntryList
                            entries={filteredEntries}
                            selectedEntryId={selectedEntryId}
                            activeCategory={activeCategory}
                            showAll={showAll}
                            onEdit={handleEditEntry}
                            onSelectCategory={handleSelectCategory}
                            onClearCategory={handleClearCategory}
                            onToggleAll={() => setShowAll((open) => !open)}
                        />
                    </div>
                )}
            </div>

            {showModal && (
                <CategoryModal onChoose={handleChooseCategory} onClose={handleCloseModal} />
            )}

            {dayModalDate && (
                <DayEntriesModal
                    date={dayModalDate}
                    category={activeCategory}
                    entries={entries.filter(
                        (entry) => entry.entry_date.slice(0, 10) === toDateKey(dayModalDate)
                            && entry.category === activeCategory,
                    )}
                    onEdit={handleEditDayEntry}
                    onNew={handleNewDayEntry}
                    onClose={handleCloseDayModal}
                />
            )}

            {showDeleteModal && (
                <ConfirmModal
                    title="Excluir registro"
                    message="Deseja realmente excluir este registro? Esta ação não pode ser desfeita."
                    confirmLabel={deleting ? 'Excluindo...' : 'Excluir'}
                    cancelLabel="Cancelar"
                    loading={deleting}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
}
