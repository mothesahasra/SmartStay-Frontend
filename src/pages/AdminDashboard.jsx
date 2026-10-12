import { useState, useEffect } from 'react';
import { userAPI, amenityAPI } from '../api';
import { LoadingSpinner, Pagination, EmptyState } from '../components/UI.jsx';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [tab, setTab] = useState('users');

  return (
    <div className="container page-wrapper">
      <h1 className="mb-lg">Admin Dashboard</h1>
      <div className="tabs">
        <button className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Users</button>
        <button className={`tab ${tab === 'amenities' ? 'active' : ''}`} onClick={() => setTab('amenities')}>Amenities</button>
      </div>
      {tab === 'users' && <UsersTab />}
      {tab === 'amenities' && <AmenitiesTab />}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => { loadUsers(0); }, []);

  const loadUsers = async (pg) => {
    setLoading(true);
    try {
      const { data } = await userAPI.getAllUsers(pg, 15);
      const d = data.data;
      setUsers(d?.content || d || []);
      setTotalPages(d?.totalPages || 1);
      setPage(d?.page ?? pg);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const deactivateUser = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      await userAPI.deactivateUser(id);
      toast.success('User deactivated');
      loadUsers(page);
    } catch (err) { toast.error(err.response?.data?.message || 'Deactivation failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <p className="text-muted mb-lg">{users.length} user(s) on this page</p>
      {users.length === 0 ? (
        <EmptyState title="No Users" message="No users registered yet." icon="👤" />
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-semibold">{u.firstName} {u.lastName}</td>
                    <td className="text-muted">{u.email}</td>
                    <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : u.role === 'MANAGER' ? 'badge-warning' : 'badge-primary'}`}>{u.role}</span></td>
                    <td><span className={`badge ${u.active !== false ? 'badge-success' : 'badge-danger'}`}>{u.active !== false ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      {u.active !== false && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deactivateUser(u.id)}
                          id={`deactivate-user-${u.id}`}
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => loadUsers(p)} />
        </>
      )}
    </div>
  );
}

function AmenitiesTab() {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '' });

  useEffect(() => { loadAmenities(); }, []);

  const loadAmenities = async () => {
    setLoading(true);
    try {
      const { data } = await amenityAPI.getAll();
      setAmenities(data.data || []);
    } catch { toast.error('Failed to load amenities'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await amenityAPI.update(editing.id, form);
        toast.success('Amenity updated');
      } else {
        await amenityAPI.create(form);
        toast.success('Amenity created');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', description: '', icon: '' });
      loadAmenities();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this amenity?')) return;
    try { await amenityAPI.delete(id); toast.success('Amenity deleted'); loadAmenities(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-lg">
        <p className="text-muted">{amenities.length} amenity(ies)</p>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', description: '', icon: '' }); }} id="add-amenity-btn">+ Add Amenity</button>
      </div>

      {showForm && (
        <div className="card card-body mb-lg animate-slideUp">
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>{editing ? 'Edit Amenity' : 'New Amenity'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-3">
              <div className="form-group"><label className="form-label">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required id="amenity-name" /></div>
              <div className="form-group"><label className="form-label">Icon (emoji)</label><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🏊" id="amenity-icon" /></div>
              <div className="form-group"><label className="form-label">Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} id="amenity-desc" /></div>
            </div>
            <div className="flex gap-sm">
              <button type="submit" className="btn btn-primary" id="save-amenity-btn">Save</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {amenities.length === 0 && !showForm ? (
        <EmptyState title="No Amenities" message="Add amenities that hotels can offer." icon="✨" />
      ) : (
        <div className="grid grid-4">
          {amenities.map((a) => (
            <div key={a.id} className="card card-body animate-slideUp" id={`amenity-${a.id}`}>
              <div className="flex items-center gap-sm mb-md">
                <span style={{ fontSize: '1.5rem' }}>{a.icon || '✨'}</span>
                <h4 style={{ margin: 0 }}>{a.name}</h4>
              </div>
              <p className="text-sm text-muted">{a.description || 'No description'}</p>
              <div className="flex gap-sm mt-md">
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(a); setForm({ name: a.name, description: a.description || '', icon: a.icon || '' }); setShowForm(true); }}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
