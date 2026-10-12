import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hotelAPI, roomAPI, reviewAPI } from '../api';
import { StarRating, LoadingSpinner, Pagination } from '../components/UI.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FiMapPin, FiPhone, FiMail, FiWifi, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function HotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [reviewPage, setReviewPage] = useState(0);
  const [reviewTotalPages, setReviewTotalPages] = useState(0);

  useEffect(() => {
    loadHotel();
    loadReviews(0);
  }, [id]);

  const loadHotel = async () => {
    try {
      const { data } = await hotelAPI.getById(id);
      setHotel(data.data);
      const roomRes = await roomAPI.getByHotel(id, 0, 50);
      setRooms(roomRes.data.data?.content || roomRes.data.data || []);
    } catch (err) {
      toast.error('Hotel not found');
      navigate('/hotels');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (pg) => {
    try {
      const { data } = await reviewAPI.getHotelReviews(id, pg, 5);
      setReviews(data.data?.content || data.data || []);
      setReviewTotalPages(data.data?.totalPages || 1);
      setReviewPage(data.data?.page ?? pg);
    } catch { /* silent */ }
  };

  const searchAvailable = async () => {
    if (!checkIn || !checkOut) { toast.error('Please select dates'); return; }
    try {
      const { data } = await roomAPI.getAvailable(id, checkIn, checkOut, 0, 50);
      setRooms(data.data?.content || data.data || []);
      toast.success(`${(data.data?.content || data.data || []).length} rooms available`);
    } catch (err) {
      toast.error('Failed to check availability');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!hotel) return null;

  const addr = hotel.address || {};

  return (
    <div className="container page-wrapper animate-fadeIn">
      {/* Hotel Header */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <img
          className="card-img"
          src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=500&fit=crop'}
          alt={hotel.name}
          style={{ height: 360 }}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=500&fit=crop'; }}
        />
        <div className="card-body">
          <div className="flex items-center justify-between flex-wrap gap-md">
            <div>
              <h1 style={{ marginBottom: '0.5rem' }}>{hotel.name}</h1>
              <div className="flex items-center gap-md text-muted">
                <span className="flex items-center gap-xs"><FiMapPin size={14} /> {addr.city}, {addr.state}, {addr.country}</span>
                <span className="flex items-center gap-xs"><StarRating rating={hotel.averageRating} /> ({hotel.totalReviews || 0} reviews)</span>
              </div>
            </div>
          </div>
          <p className="mt-md" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {hotel.description}
          </p>
          {/* Amenities */}
          {hotel.amenities?.length > 0 && (
            <div className="mt-lg">
              <h4 style={{ marginBottom: '0.75rem' }}>Amenities</h4>
              <div className="flex flex-wrap gap-sm">
                {hotel.amenities.map((a) => (
                  <span key={a.id} className="badge badge-primary">{a.icon || '✨'} {a.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Date Search */}
      <div className="card card-body mb-lg">
        <h3 style={{ marginBottom: 'var(--space-md)' }}>Check Availability</h3>
        <div className="flex flex-wrap gap-md items-center">
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 180 }}>
            <label className="form-label">Check-in</label>
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} id="detail-checkin" />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 180 }}>
            <label className="form-label">Check-out</label>
            <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} id="detail-checkout" />
          </div>
          <button className="btn btn-primary btn-lg" onClick={searchAvailable} style={{ marginTop: 'auto' }} id="check-avail-btn">
            <FiCalendar /> Search Rooms
          </button>
        </div>
      </div>

      {/* Rooms */}
      <h2 className="mb-md">Available Rooms</h2>
      {rooms.length === 0 ? (
        <div className="empty-state"><h3>No rooms found</h3><p className="text-muted">Try different dates</p></div>
      ) : (
        <div className="grid grid-3">
          {rooms.map((room) => (
            <div key={room.id} className="card animate-slideUp" id={`room-card-${room.id}`}>
              <img
                className="card-img"
                src={room.imageUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop'}
                alt={room.roomNumber}
                style={{ height: 180 }}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop'; }}
              />
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h4 style={{ margin: 0 }}>Room {room.roomNumber}</h4>
                  <span className="badge badge-primary">{room.roomType}</span>
                </div>
                <p className="text-sm text-muted mt-sm">Capacity: {room.capacity} guests</p>
                <div className="flex items-center justify-between mt-md">
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-500)' }}>
                    ${room.pricePerNight}<span className="text-sm text-muted font-semibold"> / night</span>
                  </span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      if (!isAuthenticated) { navigate('/login'); return; }
                      navigate(`/book/${room.id}`, { state: { room, hotel, checkIn, checkOut } });
                    }}
                    id={`book-room-${room.id}`}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews */}
      <div className="mt-xl">
        <h2 className="mb-md">Guest Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-muted">No reviews yet. Be the first to share your experience!</p>
        ) : (
          <>
            {reviews.map((r) => (
              <div key={r.id} className="card card-body mb-md animate-slideUp">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-100)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, color: 'var(--primary-600)', fontSize: '0.85rem',
                    }}>
                      {(r.guestName || r.userName || 'G').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold">{r.guestName || r.userName || 'Guest'}</span>
                      <div className="text-sm text-muted">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</div>
                    </div>
                  </div>
                  <StarRating rating={r.rating} size={14} />
                </div>
                <p className="mt-sm" style={{ color: 'var(--text-secondary)' }}>{r.comment}</p>
              </div>
            ))}
            <Pagination page={reviewPage} totalPages={reviewTotalPages} onPageChange={(p) => loadReviews(p)} />
          </>
        )}
      </div>
    </div>
  );
}
