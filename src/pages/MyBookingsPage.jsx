import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI, reviewAPI } from '../api';
import { StatusBadge, LoadingSpinner, Pagination, EmptyState } from '../components/UI.jsx';
import toast from 'react-hot-toast';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const navigate = useNavigate();

  useEffect(() => { loadBookings(0); }, []);

  const loadBookings = async (pg) => {
    setLoading(true);
    try {
      const { data } = await bookingAPI.getMyBookings(pg, 10);
      const d = data.data;
      setBookings(d?.content || d || []);
      setTotalPages(d?.totalPages || 1);
      setPage(d?.page ?? pg);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id);
      toast.success('Booking cancelled');
      loadBookings(page);
    } catch (err) { toast.error(err.response?.data?.message || 'Cancel failed'); }
  };

  const submitReview = async () => {
    try {
      await reviewAPI.create({ hotelId: reviewModal.hotelId, rating: reviewForm.rating, comment: reviewForm.comment });
      toast.success('Review submitted!');
      setReviewModal(null);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Review failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container page-wrapper">
      <h1 className="mb-lg">My Bookings</h1>

      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet" message="Start exploring hotels and book your first stay!" icon="📅" />
      ) : (
        <>
          {bookings.map((b) => (
            <div key={b.id} className="card card-body mb-md animate-slideUp" id={`booking-${b.id}`}>
              <div className="flex justify-between items-center flex-wrap gap-md">
                <div>
                  <div className="flex items-center gap-sm mb-md">
                    <h4 style={{ margin: 0 }}>{b.hotelName || b.roomNumber || `Booking #${b.id}`}</h4>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="flex flex-wrap gap-lg text-sm text-muted">
                    <span>📅 {b.checkInDate} → {b.checkOutDate}</span>
                    <span>🚪 Room: {b.roomNumber || b.roomId}</span>
                    <span>👥 {b.numberOfGuests} guests</span>
                    {b.confirmationCode && <span>🔑 {b.confirmationCode}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-500)' }}>
                    ${b.totalPrice?.toFixed(2)}
                  </span>
                  <div className="flex gap-sm">
                    {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>Cancel</button>
                    )}
                    {b.status === 'CHECKED_OUT' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => setReviewModal(b)}>Write Review</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => loadBookings(p)} />
        </>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--space-lg)' }}>Write a Review</h3>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: +e.target.value })} id="review-rating">
                {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{'⭐'.repeat(r)} ({r})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Comment</label>
              <textarea
                rows={4}
                placeholder="Share your experience..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                id="review-comment"
              />
            </div>
            <div className="flex gap-sm justify-between">
              <button className="btn btn-ghost" onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitReview} id="review-submit">Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
