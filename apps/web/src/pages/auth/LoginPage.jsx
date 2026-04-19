import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: 'jose@buscalibro.local',
    password: '123456',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, user]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <section className="login-panel">
        <div className="login-copy">
          <h1 className="login-title">BuscaLibro</h1>
        </div>

        <div className="login-card">
          <div className="login-header">
            <h2 className="card-title">Iniciar sesion</h2>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="field">
              <label htmlFor="email">Correo electronico</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="usuario@libreria.com"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Contrasena</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Ingresa tu contrasena"
                required
              />
            </div>

            {error ? <p className="login-error">{error}</p> : null}

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar al panel'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
