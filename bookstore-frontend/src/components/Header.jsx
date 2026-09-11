import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(search)}`);
  };

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
        <Link to="/" className="text-2xl font-bold text-orange-600">
          Kitob<span className="text-gray-800">do'koni</span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Kitob, muallif qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </form>

        <div className="flex items-center gap-4 ml-auto">
          <Link to="/cart" className="text-gray-700 hover:text-orange-600">
            🛒 Savat
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/my-orders" className="text-gray-700 hover:text-orange-600">
                Buyurtmalarim
              </Link>
              <button onClick={logout} className="text-gray-700 hover:text-orange-600">
                Chiqish
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-orange-600 text-white px-4 py-2 rounded-full text-sm hover:bg-orange-700">
              Kirish
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}