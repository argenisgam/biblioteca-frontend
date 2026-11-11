import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeftRight, BookOpen, CalendarDays, CheckCircle, Plus, Users, X } from 'lucide-react';
import { api } from './api';
import { useAuth } from './auth/AuthProvider';
import LoginPage from './auth/LoginPage';
import LibraryShell from './components/LibraryShell';
import RecordModal from './components/RecordModal';
import { BooksPanel, LoansPanel, Overview, UsersPanel } from './components/LibraryPanels';

const allNavigation = [
  { id: 'overview', label: 'Resumen', icon: CalendarDays, adminOnly: true },
  { id: 'books', label: 'Libros', icon: BookOpen },
  { id: 'loans', label: 'Préstamos', icon: ArrowLeftRight, adminOnly: true },
  { id: 'users', label: 'Lectores', icon: Users, adminOnly: true },
];
const today = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
const errorText = (error) => error?.message || 'Ocurrió un error inesperado.';

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [section, setSection] = useState('overview');
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const isAdmin = user?.rol === 'Administrador';
  const navigation = useMemo(() => allNavigation.filter((item) => !item.adminOnly || isAdmin), [isAdmin]);

  const refresh = useCallback(async (quiet = false) => {
    if (!user) return;
    if (!quiet) setLoading(true);
    setError('');

    const requests = [
      { label: 'libros', load: api.books, set: setBooks },
      ...(isAdmin ? [
        { label: 'lectores', load: api.users, set: setUsers },
        { label: 'préstamos', load: api.loans, set: setLoans },
      ] : [])
    ];
    try {
      const results = await Promise.allSettled(requests.map(({ load }) => load()));
      const failures = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') requests[index].set(Array.isArray(result.value) ? result.value : []);
        else failures.push(`${requests[index].label}: ${errorText(result.reason)}`);
      });
      if (failures.length === results.length) setError(`No fue posible cargar los datos. ${failures.join(' · ')}`);
      else if (failures.length) setError(`Algunos datos no se pudieron cargar (${failures.join(' · ')}).`);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  useEffect(() => {
    if (!user) return;
    if (!navigation.some((item) => item.id === section)) setSection(navigation[0]?.id || 'books');
  }, [navigation, section, user]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 3200);
    return () => clearTimeout(timer);
  }, [notice]);

  const activeLoans = useMemo(() => loans.filter((loan) => !loan.fecha_devolucion), [loans]);
  const availableBooks = Math.max(books.length - activeLoans.length, 0);
  const filteredBooks = books.filter((book) => `${book.titulo} ${book.autor} ${book.anio}`.toLowerCase().includes(query.toLowerCase()));
  const filteredUsers = users.filter((reader) => `${reader.nombre} ${reader.correo}`.toLowerCase().includes(query.toLowerCase()));
  const filteredLoans = loans.filter((loan) => `${loan.usuario} ${loan.libro} ${loan.fecha_prestamo}`.toLowerCase().includes(query.toLowerCase()));
  const currentTitle = navigation.find((item) => item.id === section)?.label || 'Libros';

  async function submit(payload) {
    setBusy(true);
    try {
      if (modal.type === 'book') await api.saveBook(payload, modal.item?.id);
      if (modal.type === 'user') await api.saveUser(payload, modal.item?.id);
      if (modal.type === 'loan') await api.createLoan(payload);
      setModal(null);
      setNotice(modal.type === 'loan' ? 'Préstamo registrado.' : `${modal.type === 'book' ? 'Libro' : 'Lector'} ${modal.item ? 'actualizado' : 'agregado'} correctamente.`);
      await refresh(true);
    } catch (submitError) {
      setError(errorText(submitError));
      throw submitError;
    } finally {
      setBusy(false);
    }
  }

  async function remove(kind, item) {
    const name = kind === 'book' ? item.titulo : item.nombre;
    if (!window.confirm(`¿Eliminar “${name}”? Esta acción no se puede deshacer.`)) return;
    try {
      if (kind === 'book') await api.deleteBook(item.id);
      else await api.deleteUser(item.id);
      setNotice('Registro eliminado.');
      await refresh(true);
    } catch (removeError) {
      setError(errorText(removeError));
    }
  }

  async function returnBook(loan) {
    try {
      await api.returnLoan(loan.id);
      setNotice('Devolución registrada.');
      await refresh(true);
    } catch (returnError) {
      setError(errorText(returnError));
    }
  }

  if (authLoading) return <div className="login-page"><span className="spinner" /> Validando sesión…</div>;
  if (!user) return <LoginPage />;

  function changeSection(nextSection) {
    setSection(nextSection);
    setQuery('');
  }

  return <LibraryShell nav={navigation} section={section} onSectionChange={changeSection} activeLoans={activeLoans} mobileNav={mobileNav} setMobileNav={setMobileNav} user={user} onLogout={() => logout()}>
    <div className="page-content">
      <div className="page-heading">
        <div><p className="eyebrow"><CalendarDays size={14} /> {today}</p><h1>{section === 'overview' ? 'Un buen día para leer.' : currentTitle}</h1><p className="subtitle">{section === 'overview' ? 'Aquí tienes lo que sucede hoy en tu biblioteca.' : section === 'books' ? 'Organiza y consulta la colección, título a título.' : section === 'users' ? 'Conoce a quienes dan vida a la biblioteca.' : 'Sigue cada lectura desde el préstamo hasta la devolución.'}</p></div>
        {isAdmin && <div className="heading-actions">
          {section === 'books' && <button className="primary-button" onClick={() => setModal({ type: 'book' })}><Plus size={17} /> Agregar libro</button>}
          {section === 'users' && <button className="primary-button" onClick={() => setModal({ type: 'user' })}><Plus size={17} /> Agregar lector</button>}
          {section === 'loans' && <button className="primary-button" onClick={() => setModal({ type: 'loan' })}><Plus size={17} /> Nuevo préstamo</button>}
        </div>}
      </div>

      {error && <div className="alert error-alert" role="alert"><AlertCircle size={17} /><span>{error}</span><button onClick={() => refresh(true)}>Reintentar</button><button className="alert-close" aria-label="Cerrar" onClick={() => setError('')}><X size={16} /></button></div>}
      {notice && <div className="alert success-alert" role="status"><CheckCircle size={17} /><span>{notice}</span></div>}
      {loading && <div className="loading-banner"><span className="spinner" /> Cargando información de la biblioteca…</div>}

      {section === 'overview' && isAdmin && <Overview books={books} users={users} loans={loans} activeLoans={activeLoans} availableBooks={availableBooks} setSection={changeSection} setModal={setModal} returnBook={returnBook} />}
      {section === 'books' && <BooksPanel books={filteredBooks} allBooks={books} loans={activeLoans} query={query} setQuery={setQuery} readOnly={!isAdmin} onAdd={() => setModal({ type: 'book' })} onEdit={(item) => setModal({ type: 'book', item })} onDelete={(item) => remove('book', item)} />}
      {section === 'users' && isAdmin && <UsersPanel users={filteredUsers} allUsers={users} query={query} setQuery={setQuery} onAdd={() => setModal({ type: 'user' })} onEdit={(item) => setModal({ type: 'user', item })} onDelete={(item) => remove('user', item)} />}
      {section === 'loans' && isAdmin && <LoansPanel loans={filteredLoans} allLoans={loans} activeLoans={activeLoans} query={query} setQuery={setQuery} onReturn={returnBook} />}
      <footer className="footer"><span>Hecho con cuidado para quienes aman los libros.</span><span>Biblioteca <b>·</b> 2026</span></footer>
    </div>
    {modal && isAdmin && <RecordModal modal={modal} books={books} users={users} loans={activeLoans} busy={busy} onClose={() => setModal(null)} onSubmit={submit} />}
  </LibraryShell>;
}
