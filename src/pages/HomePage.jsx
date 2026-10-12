import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hotelAPI } from '../api';
import { HotelCard, LoadingSpinner } from '../components/UI.jsx';
import { FiSearch } from 'react-icons/fi';

export default function HomePage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      const { data } = await hotelAPI.getAll(0, 8);
      setHotels(data.data?.content || data.data || []);
    } catch (err) {
      console.error('Failed to load hotels', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/hotels?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content container">
          <h1>Find Your Perfect Stay</h1>
          <p>Discover handpicked hotels and accommodations for every journey. Book with confidence, travel with joy.</p>
          <form onSubmit={handleSearch}>
            <div className="search-bar">
              <FiSearch size={20} color="rgba(255,255,255,0.6)" />
              <input
                type="text"
                placeholder="Search by hotel name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="hero-search"
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="container page-wrapper">
        <div className="flex items-center justify-between mb-lg">
          <div>
            <h2>Featured Hotels</h2>
            <p className="text-muted mt-sm">Top-rated properties curated for you</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/hotels')}>
            View All →
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : hotels.length === 0 ? (
          <div className="empty-state">
            <h3>No Hotels Available Yet</h3>
            <p className="text-muted">Check back soon for amazing stays!</p>
          </div>
        ) : (
          <div className="grid grid-4">
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onClick={() => navigate(`/hotels/${hotel.id}`)}
              />
            ))}
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-3 mt-xl" style={{ marginTop: '4rem' }}>
          {[
            { value: '500+', label: 'Hotels Listed', icon: '🏨' },
            { value: '10K+', label: 'Happy Guests', icon: '😊' },
            { value: '50+', label: 'Cities Covered', icon: '🌍' },
          ].map((stat) => (
            <div key={stat.label} className="stat-card text-center animate-slideUp">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
