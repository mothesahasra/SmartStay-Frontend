import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingAPI, paymentAPI } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function BookingPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=details, 2=payment, 3=confirmed
  const [booking, setBooking] = useState(null);

  const room = state?.room;
  const hotel = state?.hotel;
  const [checkIn, setCheckIn] = useState(state?.checkIn || '');
  const [checkOut, setCheckOut] = useState(state?.checkOut || '');
  const [guests, setGuests] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');

  if (!room || !hotel) {
    return (
      <div className="container page-wrapper">
        <div className="empty-state">
          <h3>No room selected</h3>
          <p className="text-muted">Please select a room from a hotel page first.</p>
          <button className="btn btn-primary mt-md" onClick={() => navigate('/hotels')}>Browse Hotels</button>
        </div>
      </div>
    );
  }

  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
    : 0;
  const totalPrice = nights * (room.pricePerNight || 0);

  const handleBooking = async () => {
    if (!checkIn || !checkOut) { toast.error('Please select dates'); return; }
    if (new Date(checkOut) <= new Date(checkIn)) { toast.error('Check-out must be after check-in'); return; }
    setLoading(true);
    try {
      const { data } = await bookingAPI.create({
        roomId: room.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: guests,
      });
      if (data.success) {
        setBooking(data.data);
        setStep(2);
        toast.success('Booking created! Proceed to payment.');
      } else {
        toast.error(data.message || 'Booking failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data } = await paymentAPI.process({
        bookingId: booking.id,
        paymentMethod,
        amount: booking.totalPrice || totalPrice,
      });
      if (data.success) {
        setStep(3);
        toast.success('Payment successful!');
      } else {
        toast.error(data.message || 'Payment failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-wrapper">
      {/* Progress Steps */}
      <div className="flex justify-center gap-xl mb-lg">
        {['Booking Details', 'Payment', 'Confirmed'].map((label, i) => (
          <div key={label} className="flex items-center gap-sm">
            <div style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.85rem',
              background: step > i ? 'var(--success-500)' : step === i + 1 ? 'var(--primary-500)' : 'var(--gray-300)',
              color: 'white',
            }}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-semibold ${step === i + 1 ? '' : 'text-muted'}`}>{label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ gap: 'var(--space-xl)' }}>
        {/* Left: Form */}
        <div className="card card-body animate-slideUp">
          {step === 1 && (
            <>
              <h3 style={{ marginBottom: 'var(--space-lg)' }}>Booking Details</h3>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Check-in</label>
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required id="book-checkin" />
                </div>
                <div className="form-group">
                  <label className="form-label">Check-out</label>
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required id="book-checkout" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Number of Guests</label>
                <input type="number" min={1} max={room.capacity || 10} value={guests} onChange={(e) => setGuests(+e.target.value)} id="book-guests" />
              </div>
              <button className="btn btn-primary btn-block btn-lg" onClick={handleBooking} disabled={loading} id="book-submit">
                {loading ? <span className="spinner" style={{ width: 20, height: 20 }}></span> : 'Confirm Booking'}
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <h3 style={{ marginBottom: 'var(--space-lg)' }}>Payment</h3>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} id="payment-method">
                  <option value="CREDIT_CARD">💳 Credit Card</option>
                  <option value="DEBIT_CARD">💳 Debit Card</option>
                  <option value="UPI">📱 UPI</option>
                  <option value="PAYPAL">🅿️ PayPal</option>
                </select>
              </div>
              <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <p className="text-sm text-muted">This is a simulated payment for demo purposes.</p>
              </div>
              <button className="btn btn-primary btn-block btn-lg" onClick={handlePayment} disabled={loading} id="pay-submit">
                {loading ? <span className="spinner" style={{ width: 20, height: 20 }}></span> : `Pay $${(booking?.totalPrice || totalPrice).toFixed(2)}`}
              </button>
            </>
          )}
          {step === 3 && (
            <div className="text-center" style={{ padding: 'var(--space-xl)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>🎉</div>
              <h2>Booking Confirmed!</h2>
              <p className="text-muted mt-sm">Confirmation Code: <strong>{booking?.confirmationCode || 'N/A'}</strong></p>
              <div className="flex justify-center gap-md mt-lg">
                <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>View My Bookings</button>
                <button className="btn btn-secondary" onClick={() => navigate('/hotels')}>Browse More Hotels</button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary */}
        <div className="card card-body" style={{ alignSelf: 'start', position: 'sticky', top: 90 }}>
          <h4 style={{ marginBottom: 'var(--space-md)' }}>Booking Summary</h4>
          <img
            src={room.imageUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=250&fit=crop'}
            alt={room.roomNumber}
            style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)' }}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=250&fit=crop'; }}
          />
          <h4>{hotel.name}</h4>
          <p className="text-sm text-muted">Room {room.roomNumber} · {room.roomType}</p>
          <div style={{ borderTop: '1px solid var(--gray-200)', margin: 'var(--space-md) 0', paddingTop: 'var(--space-md)' }}>
            <div className="flex justify-between text-sm mb-md">
              <span className="text-muted">Check-in</span><span className="font-semibold">{checkIn || '—'}</span>
            </div>
            <div className="flex justify-between text-sm mb-md">
              <span className="text-muted">Check-out</span><span className="font-semibold">{checkOut || '—'}</span>
            </div>
            <div className="flex justify-between text-sm mb-md">
              <span className="text-muted">Nights</span><span className="font-semibold">{nights}</span>
            </div>
            <div className="flex justify-between text-sm mb-md">
              <span className="text-muted">Rate</span><span className="font-semibold">${room.pricePerNight}/night</span>
            </div>
            <div className="flex justify-between text-sm mb-md">
              <span className="text-muted">Guests</span><span className="font-semibold">{guests}</span>
            </div>
          </div>
          <div style={{ borderTop: '2px solid var(--gray-200)', paddingTop: 'var(--space-md)' }}>
            <div className="flex justify-between">
              <span className="font-bold text-lg">Total</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-500)' }}>
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
