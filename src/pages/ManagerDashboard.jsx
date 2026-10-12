import { useState, useEffect } from 'react';
import { hotelAPI, roomAPI, bookingAPI } from '../api';
import { StatusBadge, LoadingSpinner, Pagination, EmptyState } from '../components/UI.jsx';
import toast from 'react-hot-toast';

const ROOM_TYPES = ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE', 'FAMILY', 'PRESIDENTIAL'];

export default function ManagerDashboard() {
  const [tab, setTab] = useState('hotels');

  return (
    <div className="container page-wrapper">
      <h1 className="mb-lg">Manager Dashboard</h1>
      <div className="tabs">
        <button className={`tab ${tab === 'hotels' ? 'active' : ''}`} onClick={() => setTab('hotels')}>My Hotels</button>
        <button className={`tab ${tab === 'rooms' ? 'active' : ''}`} onClick={() => setTab('rooms')}>Rooms</button>
        <button className={`tab ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>Bookings</button>
      </div>
      {tab === 'hotels' && <HotelsTab onGoToRooms={() => setTab('rooms')} />}
      {tab === 'rooms' && <RoomsTab onGoToHotels={() => setTab('hotels')} />}
      {tab === 'bookings' && <BookingsTab onGoToHotels={() => setTab('hotels')} />}
    </div>
  );
}

function HotelsTab({ onGoToRooms }) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyHotel());

  useEffect(() => { loadHotels(); }, []);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const { data } = await hotelAPI.getMyHotels(0, 50);
      setHotels(data.data?.content || data.data || []);
    } catch {
      toast.error('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  function emptyHotel() {
    return { name: '', description: '', phone: '', email: '', imageUrl: '', street: '', city: '', state: '', country: '', postalCode: '' };
  }

  const openEdit = (h) => {
    setEditing(h);
    setForm({
      name: h.name || '',
      description: h.description || '',
      phone: h.contactPhone || h.phone || '',
      email: h.contactEmail || h.email || '',
      imageUrl: (h.imageUrls && h.imageUrls[0]) || h.imageUrl || '',
      street: h.address?.street || '',
      city: h.address?.city || '',
      state: h.address?.state || '',
      country: h.address?.country || '',
      postalCode: h.address?.zipCode || h.address?.postalCode || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      contactPhone: form.phone.trim(),
      contactEmail: form.email.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      country: form.country.trim(),
      zipCode: form.postalCode.trim(),
      postalCode: form.postalCode.trim(),
      imageUrl: form.imageUrl.trim(),
      imageUrls: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
      address: {
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        zipCode: form.postalCode.trim(),
        postalCode: form.postalCode.trim(),
      },
    };

    try {
      if (editing) {
        await hotelAPI.update(editing.id, payload);
        toast.success('Hotel updated successfully');
      } else {
        await hotelAPI.create(payload);
        toast.success('Hotel created successfully');
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyHotel());
      loadHotels();
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.data && typeof resp.data === 'object') {
        const fieldErrors = Object.entries(resp.data)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        toast.error(`Validation failed: ${fieldErrors}`);
      } else {
        toast.error(resp?.message || 'Save failed');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;
    try {
      await hotelAPI.delete(id);
      toast.success('Hotel deleted');
      loadHotels();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-lg">
        <p className="text-muted">{hotels.length} hotel property(ies)</p>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm(true); setEditing(null); setForm(emptyHotel()); }}
          id="add-hotel-btn"
        >
          + Add Hotel
        </button>
      </div>

      {showForm && (
        <div className="card card-body mb-lg animate-slideUp">
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>{editing ? 'Edit Hotel' : 'New Hotel'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Hotel Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Grand Azure Resort"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your hotel, amenities, and attractions..."
                required
              />
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +1 555-0199"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. contact@hotel.com"
                />
              </div>
            </div>

            <h4 style={{ margin: 'var(--space-md) 0' }}>Address Information</h4>
            <div className="form-group">
              <label className="form-label">Street</label>
              <input
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                placeholder="e.g. 123 Main Boulevard"
              />
            </div>
            <div className="grid grid-3">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Hyderabad"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="e.g. Telangana"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Country *</label>
                <input
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="e.g. India"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Postal / Zip Code</label>
              <input
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                placeholder="e.g. 500088"
                style={{ maxWidth: 200 }}
              />
            </div>
            <div className="flex gap-sm">
              <button type="submit" className="btn btn-primary" id="save-hotel-btn">Save Hotel</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {hotels.length === 0 && !showForm ? (
        <EmptyState title="No Hotels Found" message="Add your first hotel property to get started with managing rooms and bookings." icon="🏨" />
      ) : (
        hotels.map((h) => (
          <div key={h.id} className="card card-body mb-md animate-slideUp" id={`mgr-hotel-${h.id}`}>
            <div className="flex justify-between items-center flex-wrap gap-md">
              <div className="flex items-center gap-md">
                <img
                  src={(h.imageUrls && h.imageUrls[0]) || h.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=80&h=80&fit=crop'}
                  alt={h.name}
                  style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=80&h=80&fit=crop'; }}
                />
                <div>
                  <h4 style={{ margin: 0 }}>{h.name}</h4>
                  <p className="text-sm text-muted">
                    📍 {h.address?.city || 'N/A'}, {h.address?.country || 'N/A'} · ⭐ {h.averageRating ? h.averageRating.toFixed(1) : 'New'}
                  </p>
                </div>
              </div>
              <div className="flex gap-sm">
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(h)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(h.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function RoomsTab({ onGoToHotels }) {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hotelsLoading, setHotelsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyRoom());

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    setHotelsLoading(true);
    try {
      const { data } = await hotelAPI.getMyHotels(0, 50);
      const h = data.data?.content || data.data || [];
      setHotels(h);
      if (h.length > 0) {
        setSelectedHotel((prev) => {
          const match = h.find((item) => String(item.id) === String(prev));
          const chosen = match ? match.id : h[0].id;
          loadRooms(chosen);
          return chosen;
        });
      } else {
        setSelectedHotel('');
        setRooms([]);
      }
    } catch {
      toast.error('Failed to load hotels');
    } finally {
      setHotelsLoading(false);
    }
  };

  function emptyRoom(defaultHotelId) {
    return {
      hotelId: defaultHotelId || selectedHotel || '',
      roomNumber: '',
      roomType: 'SINGLE',
      pricePerNight: '',
      capacity: 1,
      imageUrl: '',
      description: ''
    };
  }

  const loadRooms = async (hotelId) => {
    if (!hotelId) {
      setRooms([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await roomAPI.getByHotel(hotelId, 0, 50);
      setRooms(data.data?.content || data.data || []);
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleHotelChange = (e) => {
    const val = e.target.value;
    setSelectedHotel(val);
    if (val) {
      loadRooms(val);
    } else {
      setRooms([]);
    }
  };

  const openAddRoom = () => {
    setEditing(null);
    setForm(emptyRoom(selectedHotel || (hotels[0] ? hotels[0].id : '')));
    setShowForm(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({
      hotelId: r.hotelId || selectedHotel,
      roomNumber: r.roomNumber || '',
      roomType: r.roomType || 'SINGLE',
      pricePerNight: r.pricePerNight || '',
      capacity: r.capacity || 1,
      imageUrl: (r.imageUrls && r.imageUrls[0]) || r.imageUrl || '',
      description: r.description || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetHotelId = form.hotelId || selectedHotel;
    if (!targetHotelId) {
      toast.error('Please select a hotel property for this room');
      return;
    }

    const payload = {
      hotelId: Number(targetHotelId),
      roomNumber: form.roomNumber.trim(),
      roomType: form.roomType,
      capacity: parseInt(form.capacity, 10) || 1,
      pricePerNight: parseFloat(form.pricePerNight),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      imageUrls: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
      isAvailable: true,
    };

    try {
      if (editing) {
        await roomAPI.update(editing.id, payload);
        toast.success('Room updated successfully');
      } else {
        await roomAPI.create(payload);
        toast.success('Room created successfully');
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyRoom(targetHotelId));
      setSelectedHotel(targetHotelId);
      loadRooms(targetHotelId);
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.data && typeof resp.data === 'object') {
        const fieldErrors = Object.entries(resp.data)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        toast.error(`Validation failed: ${fieldErrors}`);
      } else {
        toast.error(resp?.message || 'Save failed');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await roomAPI.delete(id);
      toast.success('Room deleted');
      loadRooms(selectedHotel);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (hotelsLoading) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      {hotels.length === 0 ? (
        <div className="card card-body mb-lg" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
          <h3>No Hotels Registered Yet</h3>
          <p className="text-muted" style={{ margin: 'var(--space-md) auto', maxWidth: 460 }}>
            You need to create at least one hotel property before you can add and manage rooms.
          </p>
          <button className="btn btn-primary" onClick={onGoToHotels}>
            🏨 Go to "My Hotels" & Add Hotel
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center flex-wrap gap-md mb-lg">
            <div className="form-group" style={{ marginBottom: 0, minWidth: 280 }}>
              <label className="form-label">Select Hotel Property</label>
              <select
                value={selectedHotel}
                onChange={handleHotelChange}
                id="room-hotel-select"
                style={{ cursor: 'pointer' }}
              >
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-primary"
              onClick={openAddRoom}
              disabled={!selectedHotel}
              id="add-room-btn"
            >
              + Add Room
            </button>
          </div>

          {showForm && (
            <div className="card card-body mb-lg animate-slideUp">
              <h3 style={{ marginBottom: 'var(--space-lg)' }}>{editing ? 'Edit Room' : 'New Room'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Hotel Property *</label>
                    <select
                      value={form.hotelId || selectedHotel}
                      onChange={(e) => {
                        setForm({ ...form, hotelId: e.target.value });
                        setSelectedHotel(e.target.value);
                      }}
                      required
                      id="room-form-hotel-select"
                    >
                      {hotels.map((h) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Room Number / Name *</label>
                    <input
                      value={form.roomNumber}
                      onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                      placeholder="e.g. 101 or Presidential Suite A"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-3">
                  <div className="form-group">
                    <label className="form-label">Room Type *</label>
                    <select
                      value={form.roomType}
                      onChange={(e) => setForm({ ...form, roomType: e.target.value })}
                      required
                    >
                      {ROOM_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Capacity (Guests) *</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price per Night ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={form.pricePerNight}
                      onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
                      placeholder="e.g. 150.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Image URL</label>
                    <input
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="e.g. Ocean view balcony, king bed..."
                    />
                  </div>
                </div>

                <div className="flex gap-sm">
                  <button type="submit" className="btn btn-primary" id="save-room-btn">Save Room</button>
                  <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <LoadingSpinner />
          ) : rooms.length === 0 ? (
            <EmptyState title="No Rooms Yet" message="Add rooms to this hotel property so guests can book them." icon="🚪" />
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Price/Night</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r.id}>
                      <td className="font-semibold">{r.roomNumber}</td>
                      <td><span className="badge badge-primary">{r.roomType}</span></td>
                      <td>{r.capacity} Guest(s)</td>
                      <td className="font-semibold">${Number(r.pricePerNight).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${r.isAvailable !== false ? 'badge-success' : 'badge-danger'}`}>
                          {r.isAvailable !== false ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-sm">
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(r)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BookingsTab({ onGoToHotels }) {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    hotelAPI.getMyHotels(0, 50).then(({ data }) => {
      const h = data.data?.content || data.data || [];
      setHotels(h);
      if (h.length > 0) {
        setSelectedHotel(h[0].id);
        loadBookings(h[0].id, 0);
      }
    });
  }, []);

  const loadBookings = async (hotelId, pg) => {
    if (!hotelId) return;
    setLoading(true);
    try {
      const { data } = await bookingAPI.getHotelBookings(hotelId, pg, 10);
      const d = data.data;
      setBookings(d?.content || d || []);
      setTotalPages(d?.totalPages || 1);
      setPage(d?.page ?? pg);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'confirm') await bookingAPI.confirm(id);
      else if (action === 'checkIn') await bookingAPI.checkIn(id);
      else if (action === 'checkOut') await bookingAPI.checkOut(id);
      toast.success(`Booking ${action} successful`);
      loadBookings(selectedHotel, page);
    } catch (err) {
      toast.error(err.response?.data?.message || `${action} failed`);
    }
  };

  if (hotels.length === 0) {
    return (
      <div className="card card-body" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
        <h3>No Hotel Properties</h3>
        <p className="text-muted" style={{ margin: 'var(--space-md) auto' }}>
          Create a hotel property first to start receiving guest bookings.
        </p>
        <button className="btn btn-primary" onClick={onGoToHotels}>
          🏨 Add Hotel
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="form-group" style={{ maxWidth: 300, marginBottom: 'var(--space-lg)' }}>
        <label className="form-label">Select Hotel</label>
        <select
          value={selectedHotel}
          onChange={(e) => {
            setSelectedHotel(e.target.value);
            loadBookings(e.target.value, 0);
          }}
          id="booking-hotel-select"
        >
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : bookings.length === 0 ? (
        <EmptyState title="No Bookings" message="No reservations for this hotel yet." icon="📋" />
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.guestName || b.userId}</td>
                    <td>{b.roomNumber || b.roomId}</td>
                    <td>{b.checkInDate}</td>
                    <td>{b.checkOutDate}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td className="font-semibold">${b.totalPrice?.toFixed(2)}</td>
                    <td>
                      <div className="flex gap-xs flex-wrap">
                        {b.status === 'PENDING' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleAction(b.id, 'confirm')}>
                            Confirm
                          </button>
                        )}
                        {b.status === 'CONFIRMED' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleAction(b.id, 'checkIn')}>
                            Check In
                          </button>
                        )}
                        {b.status === 'CHECKED_IN' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleAction(b.id, 'checkOut')}>
                            Check Out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => loadBookings(selectedHotel, p)} />
        </>
      )}
    </div>
  );
}

