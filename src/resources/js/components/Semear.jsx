import { useEffect, useMemo, useState } from 'react';
import Calendar from './Calendar';
import EntryList from './EntryList';
import EntryEditor from './EntryEditor';
import CategoryModal from './CategoryModal';
import ConfirmModal from './ConfirmModal';
import BootstrapAlert from './BootstrapAlert';
import { deleteEntry, fetchEntries, saveEntry, togglePin, toggleStar } from '../api/journal';
import { logout } from '../api/auth';
import { fromDateKey, toDateKey } from '../utils/date';
import { CATEGORY_LIST } from '../utils/categories';
import { getTypeListByCategory } from '../utils/entryTypes';

/** Índice de ordenação das categorias (cor estável dos pontos do calendário). */
const CATEGORY_ORDER = Object.fromEntries(
    CATEGORY_LIST.map((category, index) => [category.value, index]),
);

/**
 * Tela principal do Semear.
 *
 * Coordena o calendário, a lista de entradas e o editor, gerenciando o
 * estado da data e da categoria selecionadas e a comunicação com a API
 * para carregar, salvar e excluir os registros.
 *
 * O editor só é exibido após o usuário escolher uma data; quando nenhuma
 * categoria está ativa, um modal pergunta entre Terapia e Sonhos.
 *
 * @returns {JSX.Element} Componente do Semear.
 */
export default function Semear({ userName }) {
    const [entries, setEntries] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [viewDate, setViewDate] = useState(new Date());
    const [activeCategory, setActiveCategory] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [pendingDate, setPendingDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [type, setType] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [feedback, setFeedback] = useState('');
    // Controla se o campo de feedback está visível no editor.
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [length, setLength] = useState(0);
    const [loadingEntries, setLoadingEntries] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
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
     * Mapa "YYYY-MM-DD" → lista de categorias com registro naquela data
     * (ordenada para manter a cor dos pontos estável). Dias com uma única
     * categoria são preenchidos com a cor dela; dias com duas ou mais exibem
     * um ponto por categoria abaixo do número.
     */
    const entryCategories = useMemo(() => {
        const map = {};
        filteredEntries.forEach((entry) => {
            const key = entry.entry_date.slice(0, 10);
            if (!map[key]) {
                map[key] = [];
            }
            if (!map[key].includes(entry.category)) {
                map[key].push(entry.category);
            }
        });
        Object.values(map).forEach((categories) => {
            categories.sort((a, b) => CATEGORY_ORDER[a] - CATEGORY_ORDER[b]);
        });
        return map;
    }, [filteredEntries]);

    /** Entrada correspondente à data e categoria em edição, se existir. */
    const selectedEntry = useMemo(
        () => entries.find(
            (entry) => entry.entry_date.slice(0, 10) === selectedKey
                && entry.category === editingCategory,
        ) || null,
        [entries, selectedKey, editingCategory],
    );

    // Atualiza o tipo, o título, o conteúdo e o feedback do editor sempre que a entrada muda.
    useEffect(() => {
        setType(selectedEntry?.type || null);
        setTitle(selectedEntry?.title || '');
        const entryFeedback = selectedEntry?.feedback || '';
        setFeedback(entryFeedback);
        // Ao abrir o registro, o campo de feedback começa oculto quando está vazio;
        // se já houver feedback, ele é exibido e pode ser ocultado ao clicar.
        const feedbackText = entryFeedback.replace(/<[^>]*>/g, '').trim();
        setFeedbackVisible(feedbackText !== '');
        const html = selectedEntry?.content || '';
        setContent(html);
        const text = html.replace(/<[^>]*>/g, '');
        setLength(text.length);
    }, [selectedEntry]);

    /**
     * Abre o editor para a data informada. Se um filtro de categoria estiver
     * ativo, edita diretamente nessa categoria; caso contrário, guarda a data
     * e abre o modal para o usuário escolher a categoria do registro.
     *
     * @param {Date} date - Data escolhida.
     */
    const handleSelectDate = (date) => {
        setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
        if (activeCategory) {
            setEditingCategory(activeCategory);
            setSelectedDate(date);
        } else {
            setPendingDate(date);
            setShowModal(true);
        }
    };

    /**
     * Define a categoria escolhida no modal e abre o editor na data pendente.
     * A escolha define apenas a categoria do registro em edição; o filtro da
     * lista e do calendário permanece como estava.
     *
     * @param {string} category - Categoria selecionada ("terapia" ou "sonhos").
     */
    const handleChooseCategory = (category) => {
        const date = pendingDate || new Date();
        setEditingCategory(category);
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
     * Limpa o filtro de categoria da lista e do calendário.
     */
    const handleClearCategory = () => {
        setActiveCategory(null);
    };

    const handleCloseEditor = () => {
        setSelectedDate(null);
        setEditingCategory(null);
    };

    /**
     * Abre no editor a entrada escolhida na lista, sem alterar o filtro ativo.
     *
     * @param {Object} entry - Entrada que será alterada.
     */
    const handleEditEntry = (entry) => {
        const date = fromDateKey(entry.entry_date.slice(0, 10));
        setEditingCategory(entry.category);
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
     * Salva (cria ou atualiza) a entrada da data e categoria selecionadas.
     */
    const handleSave = async () => {
        const isEditing = Boolean(selectedEntry);
        setSaving(true);
        setAlert(null);
        try {
            // O tipo pertence às categorias com tipos ("Sonhos" e "Centro");
            // nas demais é descartado. O feedback está disponível para todas.
            const entryType = getTypeListByCategory(editingCategory).length > 0 ? type : null;
            const saved = await saveEntry(selectedKey, content, editingCategory, entryType, title, feedback);
            setEntries((current) => {
                const others = current.filter((entry) => entry.id !== saved.id);
                return [saved, ...others].sort((a, b) => b.entry_date.localeCompare(a.entry_date));
            });
            // Limpa os campos do editor para que uma nova data não herde o conteúdo anterior.
            setType(null);
            setTitle('');
            setContent('');
            setFeedback('');
            setLength(0);
            setSelectedDate(null);
            setEditingCategory(null);
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
     * Fixa ou desafixa uma entrada diretamente na listagem.
     *
     * Atualiza o estado local com a entrada retornada pela API, mantendo as
     * fixadas em destaque no topo da lista.
     *
     * @param {Object} entry - Entrada que terá a fixação alternada.
     */
    const handleTogglePin = async (entry) => {
        try {
            const updated = await togglePin(entry.id, !entry.pinned);
            setEntries((current) => current.map(
                (item) => (item.id === updated.id ? updated : item),
            ));
        } catch (error) {
            setAlert({
                type: 'danger',
                message: error.message,
            });
        }
    };

    /**
     * Marca ou desmarca a estrela (favorito) de uma entrada na listagem.
     *
     * Atualiza o estado local com a entrada retornada pela API.
     *
     * @param {Object} entry - Entrada que terá a estrela alternada.
     */
    const handleToggleStar = async (entry) => {
        try {
            const updated = await toggleStar(entry.id, !entry.starred);
            setEntries((current) => current.map(
                (item) => (item.id === updated.id ? updated : item),
            ));
        } catch (error) {
            setAlert({
                type: 'danger',
                message: error.message,
            });
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
            setType(null);
            setTitle('');
            setContent('');
            setFeedback('');
            setLength(0);
            setShowDeleteModal(false);
            setSelectedDate(null);
            setEditingCategory(null);
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
                    <div className="semear__brand">
                        <h1 className="semear__title">
                            <span className="semear__logo">🌱</span> Semear
                        </h1>
                        <a className="semear-nav-link" href="/dashboard">
                            Dashboard
                        </a>
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
                    <div className="semear__layout semear__layout--no-editor">
                        <div className="semear-panel semear__calendar">
                            <Calendar
                                viewDate={viewDate}
                                selectedDate={selectedDate}
                                entryCategories={entryCategories}
                                activeCategory={editingCategory || activeCategory}
                                onPrev={() => changeMonth(-1)}
                                onNext={() => changeMonth(1)}
                                onSelect={handleSelectDate}
                            />
                        </div>

                        <EntryList
                            entries={filteredEntries}
                            selectedDate={selectedDate}
                            activeCategory={activeCategory}
                            onEdit={handleEditEntry}
                            onTogglePin={handleTogglePin}
                            onToggleStar={handleToggleStar}
                            onSelectCategory={handleSelectCategory}
                            onClearCategory={handleClearCategory}
                        />
                    </div>
                )}
            </div>

            {showModal && (
                <CategoryModal onChoose={handleChooseCategory} onClose={handleCloseModal} />
            )}

            {selectedDate && editingCategory && (
                <EntryEditor
                    selectedDate={selectedDate}
                    category={editingCategory}
                    type={type}
                    title={title}
                    content={content}
                    feedback={feedback}
                    feedbackVisible={feedbackVisible}
                    length={length}
                    canDelete={Boolean(selectedEntry)}
                    saving={saving}
                    deleting={deleting}
                    onTypeChange={setType}
                    onTitleChange={setTitle}
                    onFeedbackChange={setFeedback}
                    onToggleFeedback={() => setFeedbackVisible((visible) => !visible)}
                    onChange={handleChange}
                    onSave={handleSave}
                    onDelete={handleRequestDelete}
                    onBack={handleCloseEditor}
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
