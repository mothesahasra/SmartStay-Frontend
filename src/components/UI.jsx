import { FiStar } from 'react-icons/fi';

export function StarRating({ rating, size = 16 }) {
  const stars = [];
  const full = Math.floor(rating || 0);
  for (let i = 0; i < 5; i++) {
    stars.push(
      <FiStar
        key={i}
        size={size}
        fill={i < full ? '#f59f00' : 'none'}
        color={i < full ? '#f59f00' : '#ced4da'}
      />
    );
  }
  return <span className="stars">{stars}</span>;
}

export function StatusBadge({ status }) {
  const map = {
    PENDING: 'badge-warning',
    CONFIRMED: 'badge-primary',
    CHECKED_IN: 'badge-success',
    CHECKED_OUT: 'badge-neutral',
    CANCELLED: 'badge-danger',
    COMPLETED: 'badge-success',
    FAILED: 'badge-danger',
    REFUNDED: 'badge-neutral',
  };
  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>;
}

export function LoadingSpinner() {
  return (
    <div className="loading-page">
      <div className="spinner"></div>
      <p className="text-muted">Loading...</p>
    </div>
  );
}

export function EmptyState({ icon, title, message }) {
  return (
    <div className="empty-state">
      {icon && <div className="icon">{icon}</div>}
      <h3>{title || 'Nothing here yet'}</h3>
      <p className="text-muted mt-sm">{message}</p>
    </div>
  );
}

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages, start + 5);
  for (let i = start; i < end; i++) {
    pages.push(i);
  }
  return (
    <div className="pagination">
      <button disabled={page === 0} onClick={() => onPageChange(page - 1)}>‹</button>
      {pages.map((p) => (
        <button key={p} className={p === page ? 'active' : ''} onClick={() => onPageChange(p)}>
          {p + 1}
        </button>
      ))}
      <button disabled={page === totalPages - 1} onClick={() => onPageChange(page + 1)}>›</button>
    </div>
  );
}

export function HotelCard({ hotel, onClick }) {
  return (
    <div className="card animate-slideUp" onClick={onClick} style={{ cursor: 'pointer' }} id={`hotel-card-${hotel.id}`}>
      <img
        className="card-img"
        src={(hotel.imageUrls && hotel.imageUrls[0]) || hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop'}
        alt={hotel.name}
        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop'; }}
      />
      <div className="card-body">
        <div className="flex items-center justify-between mb-md">
          <h4 style={{ margin: 0 }}>{hotel.name}</h4>
          <StarRating rating={hotel.averageRating} size={14} />
        </div>
        <p className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>
          📍 {hotel.address?.city || hotel.city}, {hotel.address?.country || hotel.country}
        </p>
        <p className="text-sm" style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          color: 'var(--text-secondary)',
        }}>
          {hotel.description}
        </p>
      </div>
    </div>
  );
}
