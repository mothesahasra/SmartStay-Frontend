import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '', role: 'GUEST',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, firstName, lastName, ...rest } = form;
      const payload = { ...rest, name: `${firstName} ${lastName}`.trim() };
      await register(payload);
      navigate('/');
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.data && typeof resp.data === 'object') {
        const firstErr = Object.values(resp.data)[0];
        toast.error(firstErr || resp.message || 'Registration failed');
      } else {
        toast.error(resp?.message || err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="container page-wrapper">
      <div className="card form-card animate-slideUp" style={{ maxWidth: 540 }}>
        <div className="text-center mb-lg">
          <h2>Create Account</h2>
          <p className="text-muted mt-sm">Join SmartStay and start booking</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input placeholder="John" value={form.firstName} onChange={set('firstName')} required id="reg-fname" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input placeholder="Doe" value={form.lastName} onChange={set('lastName')} required id="reg-lname" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required id="reg-email" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={set('phone')} id="reg-phone" />
          </div>
          <div className="form-group">
            <label className="form-label">I am a</label>
            <select value={form.role} onChange={set('role')} id="reg-role">
              <option value="GUEST">Guest — I want to book hotels</option>
              <option value="MANAGER">Hotel Manager — I manage properties</option>
            </select>
          </div>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required minLength={8} id="reg-pass" />
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>Minimum 8 characters</small>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} required minLength={8} id="reg-confirm" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} id="reg-submit">
            {loading ? <span className="spinner" style={{ width: 20, height: 20 }}></span> : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-muted mt-lg">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
