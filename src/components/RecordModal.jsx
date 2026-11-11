import React, { useState } from 'react';
import { AlertCircle, ArrowLeftRight, BookOpen, CircleHelp, Users, X } from 'lucide-react';

export default function RecordModal({ modal, books, users, loans, busy, onClose, onSubmit }) {
  const isBook = modal.type === 'book';
  const isUser = modal.type === 'user';
  const isLoan = modal.type === 'loan';
  const [values, setValues] = useState(() => modal.item
    ? { ...modal.item }
    : isBook ? { titulo: '', autor: '', anio: '' }
      : isUser ? { nombre: '', correo: '', username: '', password: '' }
        : { usuario_id: '', libro_id: '' });
  const [formError, setFormError] = useState('');
  const label = isBook ? 'libro' : isUser ? 'lector' : 'préstamo';
  const checkedOutTitles = new Set(loans.map((loan) => String(loan.libro || '').toLocaleLowerCase()));

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    if (isBook && (!values.titulo.trim() || !values.autor.trim() || !values.anio)) {
      setFormError('Completa el título, el autor y el año.');
      return;
    }
    if (isUser && (!values.nombre.trim() || !values.correo.trim() || (!modal.item && (!values.username.trim() || !values.password)))) {
      setFormError(modal.item ? 'Completa el nombre y el correo.' : 'Completa el nombre, el correo, el usuario y la contraseña.');
      return;
    }
    if (isUser && !modal.item && values.password.length < 12) {
      setFormError('La contraseña debe tener al menos 12 caracteres.');
      return;
    }
    if (isLoan && (!values.usuario_id || !values.libro_id)) {
      setFormError('Selecciona un lector y un libro.');
      return;
    }

    const payload = isBook
      ? { titulo: values.titulo.trim(), autor: values.autor.trim(), anio: Number(values.anio) }
      : isUser
        ? {
          nombre: values.nombre.trim(),
          correo: values.correo.trim(),
          ...(!modal.item ? { username: values.username.trim(), password: values.password } : {})
        }
        : { usuario_id: Number(values.usuario_id), libro_id: Number(values.libro_id) };
    try {
      await onSubmit(payload);
    } catch (error) {
      setFormError(error.message);
    }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => {
    if (event.target === event.currentTarget) onClose();
  }}>
    <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-heading">
        <span className="modal-icon">{isBook ? <BookOpen size={20} /> : isUser ? <Users size={20} /> : <ArrowLeftRight size={20} />}</span>
        <button className="icon-button modal-close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        <span className="section-kicker">{modal.item ? 'EDITAR REGISTRO' : 'NUEVO REGISTRO'}</span>
        <h2 id="modal-title">{modal.item ? 'Actualizar' : 'Agregar'} {label}</h2>
        <p>Completa los datos para {modal.item ? 'guardar los cambios' : 'continuar'}.</p>
      </div>
      <form className="record-form" onSubmit={handleSubmit}>
        {isBook && <>
          <FormField label="Título" required><input autoFocus value={values.titulo || ''} onChange={(event) => update('titulo', event.target.value)} placeholder="Ej. Cien años de soledad" /></FormField>
          <FormField label="Autor" required><input value={values.autor || ''} onChange={(event) => update('autor', event.target.value)} placeholder="Nombre del autor" /></FormField>
          <FormField label="Año de publicación" required><input type="number" min="0" max="2100" value={values.anio || ''} onChange={(event) => update('anio', event.target.value)} placeholder="Ej. 1967" /></FormField>
        </>}
        {isUser && <>
          <FormField label="Nombre completo" required><input autoFocus value={values.nombre || ''} onChange={(event) => update('nombre', event.target.value)} placeholder="Nombre del lector" /></FormField>
          <FormField label="Correo electrónico" required><input type="email" value={values.correo || ''} onChange={(event) => update('correo', event.target.value)} placeholder="lector@correo.com" /></FormField>
          {!modal.item && <>
            <FormField label="Usuario para iniciar sesión" required><input autoComplete="username" minLength={3} maxLength={50} value={values.username || ''} onChange={(event) => update('username', event.target.value)} placeholder="usuario" /></FormField>
            <FormField label="Contraseña inicial" required><input type="password" autoComplete="new-password" minLength={12} value={values.password || ''} onChange={(event) => update('password', event.target.value)} placeholder="Mínimo 12 caracteres" /></FormField>
            <div className="form-note"><CircleHelp size={15} /> La cuenta se creará con permiso para consultar el catálogo.</div>
          </>}
        </>}
        {isLoan && <>
          <FormField label="Lector" required>
            <select autoFocus value={values.usuario_id} onChange={(event) => update('usuario_id', event.target.value)}><option value="">Selecciona un lector</option>{users.map((user) => <option key={user.id} value={user.id}>{user.nombre} · {user.correo}</option>)}</select>
            {!users.length && <small className="field-hint">Primero registra al menos un lector.</small>}
          </FormField>
          <FormField label="Libro disponible" required>
            <select value={values.libro_id} onChange={(event) => update('libro_id', event.target.value)}><option value="">Selecciona un libro</option>{books.filter((book) => !checkedOutTitles.has(String(book.titulo || '').toLocaleLowerCase())).map((book) => <option key={book.id} value={book.id}>{book.titulo} · {book.autor}</option>)}</select>
            {!books.length && <small className="field-hint">Primero agrega libros a tu catálogo.</small>}
          </FormField>
          <div className="form-note"><CircleHelp size={15} /> La fecha de préstamo se asigna automáticamente.</div>
        </>}
        {formError && <div className="form-error" role="alert"><AlertCircle size={15} /> {formError}</div>}
        <div className="modal-actions"><button type="button" className="cancel-button" onClick={onClose}>Cancelar</button><button type="submit" disabled={busy} className="primary-button">{busy ? 'Guardando…' : modal.item ? 'Guardar cambios' : isLoan ? 'Registrar préstamo' : `Agregar ${label}`}</button></div>
      </form>
    </section>
  </div>;
}

function FormField({ label, required, children }) {
  return <label className="form-field"><span>{label}{required && <i> *</i>}</span>{children}</label>;
}
