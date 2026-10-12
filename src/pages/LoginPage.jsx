import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await login(form.email, form.password);
      if (userData.role === 'MANAGER') navigate('/manager');
      else if (userData.role === 'ADMIN') navigate('/admin');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-wrapper">
      <div className="card form-card animate-slideUp">
        <div className="text-center mb-lg">
          <h2>Welcome Back</h2>
          <p className="text-muted mt-sm">Sign in to your SmartStay account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              id="login-email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              id="login-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} id="login-submit">
            {loading ? <span className="spinner" style={{ width: 20, height: 20 }}></span> : 'Sign In'}
          </button>
        </form>

        <div className="mt-lg pt-md" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs text-muted text-center mb-sm">⚡ Quick Demo Login:</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => { setForm({ email: 'guest@smartstay.com', password: 'guest12345' }); }}
            >
              Guest
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => { setForm({ email: 'manager@smartstay.com', password: 'manager12345' }); }}
            >
              Manager
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => { setForm({ email: 'admin@smartstay.com', password: 'admin12345' }); }}
            >
              Admin
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-muted mt-lg">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
