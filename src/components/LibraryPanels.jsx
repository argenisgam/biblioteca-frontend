import React from 'react';
import { ArrowLeftRight, BookOpen, CheckCircle, ChevronRight, Clock3, Pencil, Plus, RotateCcw, Search, Trash2, Users } from 'lucide-react';

export function Overview({ books, users, loans, activeLoans, availableBooks, setSection, setModal, returnBook }) {
  const recent = [...loans].sort((a, b) => String(b.fecha_prestamo || '').localeCompare(String(a.fecha_prestamo || ''))).slice(0, 5);
  return <>
    <section className="stats-grid">
      <StatCard icon={BookOpen} label="Libros en colección" value={books.length} note={`${availableBooks} disponibles ahora`} tone="sage" />
      <StatCard icon={ArrowLeftRight} label="Préstamos activos" value={activeLoans.length} note={activeLoans.length ? 'Lecturas fuera de la biblioteca' : 'Todo está en su estante'} tone="peach" />
      <StatCard icon={Users} label="Lectores registrados" value={users.length} note="Comunidad de lectura" tone="lavender" />
      <StatCard icon={CheckCircle} label="Devoluciones" value={loans.length - activeLoans.length} note="Libros que volvieron a casa" tone="blue" />
    </section>
    <section className="overview-grid">
      <div className="panel collection-panel">
        <div className="panel-heading"><div><span className="section-kicker">TU COLECCIÓN</span><h2>Estantería reciente</h2></div><button className="text-link" onClick={() => setSection('books')}>Ver todos <ChevronRight size={15} /></button></div>
        {books.length ? <div className="shelf-list">{books.slice(0, 5).map((book, index) => {
          const borrowed = activeLoans.some((loan) => String(loan.libro).toLowerCase() === String(book.titulo).toLowerCase());
          return <div className="shelf-row" key={book.id}><div className={`book-cover cover-${index % 5}`}><span>{book.titulo?.slice(0, 1)}</span><i /></div><div className="book-info"><strong>{book.titulo}</strong><span>{book.autor || 'Autor no especificado'}</span></div><span className="book-year">{book.anio || '—'}</span><span className={`availability ${borrowed ? 'checked-out' : ''}`}><i />{borrowed ? 'Prestado' : 'Disponible'}</span></div>;
        })}</div> : <EmptyState icon={BookOpen} title="Tu estantería empieza aquí" message="Agrega el primer libro para ver tu colección." action="Agregar libro" onAction={() => setModal({ type: 'book' })} />}
        <div className="panel-bottom"><span className="shelf-note"><span className="note-dot" /> Tu colección, siempre a mano</span><button className="small-action" onClick={() => setModal({ type: 'book' })}><Plus size={14} /> Agregar</button></div>
      </div>
      <div className="right-column">
        <div className="panel loan-panel">
          <div className="panel-heading"><div><span className="section-kicker">EN CIRCULACIÓN</span><h2>Préstamos activos</h2></div><button className="round-count" onClick={() => setSection('loans')}>{activeLoans.length}</button></div>
          {activeLoans.length ? <div className="active-list">{activeLoans.slice(0, 4).map((loan) => <div className="active-loan" key={loan.id}><div className="loan-avatar">{String(loan.usuario || '?').slice(0, 1).toUpperCase()}</div><div className="active-loan-info"><strong>{loan.usuario || 'Lector'}</strong><span>{loan.libro || 'Libro'}</span></div><button className="return-mini" title="Registrar devolución" onClick={() => returnBook(loan)}><RotateCcw size={15} /></button></div>)}</div> : <div className="quiet-state"><span className="quiet-icon"><BookOpen size={19} /></span><strong>Todo está en casa</strong><span>No hay libros prestados por ahora.</span></div>}
          <button className="outline-button full-width" onClick={() => setModal({ type: 'loan' })}><Plus size={15} /> Registrar préstamo</button>
        </div>
        <div className="quote-card"><div className="quote-stars">✳ <span>UN RINCÓN PARA LEER</span></div><p>“Los libros son espejos: solo se ve en ellos lo que uno ya lleva dentro.”</p><span className="quote-credit">— Carlos Ruiz Zafón</span><div className="quote-decoration">❧</div></div>
      </div>
    </section>
    <section className="panel recent-panel"><div className="panel-heading"><div><span className="section-kicker">ACTIVIDAD</span><h2>Últimos movimientos</h2></div><button className="text-link" onClick={() => setSection('loans')}>Ver todos <ChevronRight size={15} /></button></div><LoanTable loans={recent} onReturn={returnBook} compact /></section>
  </>;
}

export function BooksPanel({ books, allBooks, loans, query, setQuery, onAdd, onEdit, onDelete, readOnly = false }) {
  const borrowed = new Set(loans.map((loan) => String(loan.libro || '').toLocaleLowerCase()));
  return <section className="panel data-panel">
    <div className="data-toolbar"><div><span className="section-kicker">CATÁLOGO</span><h2>Todos los libros <span className="inline-count">{allBooks.length}</span></h2></div><SearchBox query={query} setQuery={setQuery} placeholder="Buscar título o autor…" /></div>
    {books.length ? <div className="table-wrap"><table><thead><tr><th>TÍTULO</th><th>AUTOR</th><th>AÑO</th><th>ESTADO</th>{!readOnly && <th className="actions-cell">ACCIONES</th>}</tr></thead><tbody>{books.map((book, index) => {
      const isBorrowed = borrowed.has(String(book.titulo || '').toLocaleLowerCase());
      return <tr key={book.id}><td><div className="table-book"><div className={`book-cover mini-cover cover-${index % 5}`}><span>{book.titulo?.slice(0, 1)}</span><i /></div><div><strong>{book.titulo}</strong><small>Ref. #{book.id}</small></div></div></td><td>{book.autor || '—'}</td><td>{book.anio || '—'}</td><td><span className={`status-pill ${isBorrowed ? 'loan-active-pill' : 'available-pill'}`}><i />{isBorrowed ? 'Prestado' : 'Disponible'}</span></td>{!readOnly && <td><RowActions onEdit={() => onEdit(book)} onDelete={() => onDelete(book)} /></td>}</tr>;
    })}</tbody></table></div> : <EmptyState icon={BookOpen} title={allBooks.length ? 'No encontramos coincidencias' : 'Tu catálogo está vacío'} message={allBooks.length ? 'Prueba con otro título o autor.' : 'Agrega libros para empezar a organizar tu colección.'} action={allBooks.length && readOnly ? undefined : 'Agregar libro'} onAction={onAdd} />}
  </section>;
}

export function UsersPanel({ users, allUsers, query, setQuery, onAdd, onEdit, onDelete }) {
  return <section className="panel data-panel">
    <div className="data-toolbar"><div><span className="section-kicker">COMUNIDAD</span><h2>Lectores registrados <span className="inline-count">{allUsers.length}</span></h2></div><SearchBox query={query} setQuery={setQuery} placeholder="Buscar nombre o correo…" /></div>
    {users.length ? <div className="table-wrap"><table><thead><tr><th>LECTOR</th><th>CORREO ELECTRÓNICO</th><th>ID</th><th className="actions-cell">ACCIONES</th></tr></thead><tbody>{users.map((user, index) => <tr key={user.id}><td><div className="user-cell"><div className={`user-avatar user-tone-${index % 5}`}>{String(user.nombre || '?').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div><strong>{user.nombre}</strong></div></td><td>{user.correo || '—'}</td><td><span className="id-label">#{user.id}</span></td><td><RowActions onEdit={() => onEdit(user)} onDelete={() => onDelete(user)} /></td></tr>)}</tbody></table></div> : <EmptyState icon={Users} title={allUsers.length ? 'No encontramos coincidencias' : 'Tu comunidad comienza aquí'} message={allUsers.length ? 'Prueba con otro nombre o correo.' : 'Registra lectores para poder crear préstamos.'} action={allUsers.length ? undefined : 'Agregar lector'} onAction={onAdd} />}
  </section>;
}

export function LoansPanel({ loans, allLoans, activeLoans, query, setQuery, onReturn }) {
  return <section className="panel data-panel">
    <div className="loan-tabs"><div><span className="section-kicker">CIRCULACIÓN</span><h2>Registro de préstamos <span className="inline-count">{allLoans.length}</span></h2></div><div className="loan-summary"><span><i className="active-dot" />{activeLoans.length} activos</span><span><i className="returned-dot" />{allLoans.length - activeLoans.length} devueltos</span></div></div>
    <div className="table-filter"><SearchBox query={query} setQuery={setQuery} placeholder="Buscar lector o libro…" /></div>
    <LoanTable loans={loans} onReturn={onReturn} /><div className="table-footnote"><Clock3 size={14} /> Las fechas se registran según el servidor de la biblioteca.</div>
  </section>;
}

function LoanTable({ loans, onReturn, compact = false }) {
  if (!loans.length) return <EmptyState icon={ArrowLeftRight} title="Aún no hay préstamos" message="Cuando se preste un libro, aparecerá aquí." />;
  return <div className="table-wrap"><table><thead><tr><th>LECTOR</th><th>LIBRO</th><th>FECHA DE PRÉSTAMO</th><th>ESTADO</th>{!compact && <th className="actions-cell">ACCIÓN</th>}</tr></thead><tbody>{loans.map((loan) => {
    const active = !loan.fecha_devolucion;
    return <tr key={loan.id}><td><div className="user-cell"><div className="user-avatar user-tone-1">{String(loan.usuario || '?').slice(0, 1).toUpperCase()}</div><strong>{loan.usuario || '—'}</strong></div></td><td><div className="loan-book-name"><BookOpen size={15} />{loan.libro || '—'}</div></td><td>{formatDate(loan.fecha_prestamo)}</td><td><span className={`status-pill ${active ? 'loan-active-pill' : 'returned-pill'}`}><i />{active ? 'En préstamo' : 'Devuelto'}</span></td>{!compact && <td>{active ? <button className="return-button" onClick={() => onReturn(loan)}><RotateCcw size={14} /> Registrar devolución</button> : <span className="muted-dash">—</span>}</td>}</tr>;
  })}</tbody></table></div>;
}

function StatCard({ icon: Icon, label, value, note, tone }) {
  return <div className="stat-card"><span className={`stat-icon ${tone}`}><Icon size={19} strokeWidth={1.8} /></span><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-note">{note}</span><span className={`stat-ornament ${tone}`}><Icon size={56} strokeWidth={0.8} /></span></div>;
}

function SearchBox({ query, setQuery, placeholder }) {
  return <label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} /><kbd>⌘ K</kbd></label>;
}

function RowActions({ onEdit, onDelete }) {
  return <div className="row-actions"><button className="action-button" aria-label="Editar" title="Editar" onClick={onEdit}><Pencil size={15} /></button><button className="action-button delete-action" aria-label="Eliminar" title="Eliminar" onClick={onDelete}><Trash2 size={15} /></button></div>;
}

function EmptyState({ icon: Icon, title, message, action, onAction }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={22} /></span><strong>{title}</strong><p>{message}</p>{action && onAction && <button className="primary-button" onClick={onAction}><Plus size={16} /> {action}</button>}</div>;
}

function formatDate(date) {
  if (!date) return '—';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed);
}
