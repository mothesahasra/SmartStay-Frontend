import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { hotelAPI } from '../api';
import { HotelCard, LoadingSpinner, Pagination } from '../components/UI.jsx';
import { FiSearch } from 'react-icons/fi';

export default function HotelListPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchQuery(q);
    loadHotels(q, 0);
  }, [searchParams]);

  const loadHotels = async (query, pg) => {
    setLoading(true);
    try {
      let res;
      if (query) {
        res = await hotelAPI.search(query, pg, 12);
      } else {
        res = await hotelAPI.getAll(pg, 12);
      }
      const d = res.data.data;
      setHotels(d?.content || d || []);
      setTotalPages(d?.totalPages || 1);
      setPage(d?.page ?? pg);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/hotels?search=${encodeURIComponent(searchQuery)}`);
  };

  const handlePageChange = (newPage) => {
    loadHotels(searchQuery, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container page-wrapper">
      <div className="flex items-center justify-between flex-wrap gap-md mb-lg">
        <div>
          <h1>Explore Hotels</h1>
          <p className="text-muted mt-sm">
            {searchQuery ? `Results for "${searchQuery}"` : 'Browse all available properties'}
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-sm items-center">
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              type="text"
              placeholder="Search hotels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: 280 }}
              id="hotel-list-search"
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : hotels.length === 0 ? (
        <div className="empty-state">
          <h3>No Hotels Found</h3>
          <p className="text-muted">Try a different search term</p>
        </div>
      ) : (
        <>
          <div className="grid grid-3">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} onClick={() => navigate(`/hotels/${hotel.id}`)} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}
