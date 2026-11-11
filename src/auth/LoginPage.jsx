import React, { useState } from 'react';
import { AlertCircle, BookOpen, LockKeyhole } from 'lucide-react';
import { useAuth } from './AuthProvider';
import './login.css';

export default function LoginPage() {
  const { login, register, sessionMessage } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(sessionMessage);
  const [busy, setBusy] = useState(false);
  const isRegistering = mode === 'register';

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isRegistering) {
        await register({ nombre: name, username, email: email.trim(), password });
      } else {
        await login({ email: email.trim(), password });
      }
    } catch (authError) {
      setError(authError.message);
    } finally {
      setBusy(false);
    }
  }

  return <main className="login-page">
    <section className="login-card">
      <div className="login-brand"><span className="login-brand-mark"><BookOpen size={22} /></span><span><strong>página</strong><small>BIBLIOTECA</small></span></div>
      <span className="login-kicker">PANEL DE GESTIÓN</span>
      <h1>{isRegistering ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h1>
      <p className="login-description">{isRegistering ? 'Regístrate para consultar el catálogo de la biblioteca.' : 'Inicia sesión con tu cuenta de biblioteca para continuar.'}</p>
      <form className="login-form" onSubmit={handleSubmit}>
        {isRegistering && <>
          <label className="form-field"><span>Nombre completo</span><input type="text" autoComplete="name" required maxLength={255} autoFocus={isRegistering} value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu nombre" /></label>
          <label className="form-field"><span>Nombre de usuario</span><input type="text" autoComplete="username" required minLength={3} maxLength={50} pattern="[a-zA-Z0-9._-]{3,50}" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="usuario" /></label>
        </>}
        <label className="form-field"><span>Correo electrónico</span><input type="email" autoComplete="username" required autoFocus={!isRegistering} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@biblioteca.com" /></label>
        <label className="form-field"><span>Contraseña</span><input type="password" autoComplete={isRegistering ? 'new-password' : 'current-password'} minLength={isRegistering ? 12 : undefined} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isRegistering ? 'Mínimo 12 caracteres' : 'Tu contraseña'} /></label>
        {error && <div className="form-error" role="alert"><AlertCircle size={15} />{error}</div>}
        {isRegistering && <p className="register-note">Las cuentas nuevas solo pueden consultar el catálogo.</p>}
        <button className="primary-button login-submit" type="submit" disabled={busy}><LockKeyhole size={16} />{busy ? (isRegistering ? 'Creando cuenta…' : 'Validando…') : (isRegistering ? 'Crear cuenta' : 'Iniciar sesión')}</button>
      </form>
      <p className="login-switch">{isRegistering ? '¿Ya tienes una cuenta?' : '¿Aún no tienes una cuenta?'} <button type="button" onClick={() => { setError(''); setMode(isRegistering ? 'login' : 'register'); }}>{isRegistering ? 'Inicia sesión' : 'Crear cuenta'}</button></p>
      {!isRegistering && <p className="login-footnote">El acceso y las acciones disponibles dependen de tu rol.</p>}
    </section>
  </main>;
}
