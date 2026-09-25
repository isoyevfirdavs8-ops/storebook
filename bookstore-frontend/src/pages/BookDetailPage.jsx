import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getBook } from '../services/books';
import { addToCart } from '../services/cart';
import { useAuth } from '../context/AuthContext';

export default function BookDetailPage() {
  const { slug } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getBook(slug)
      .then((res) => setBook(res.data))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(book.id, quantity);
      setMessage("Savatga qo'shildi!");
    } catch {
      setMessage('Xatolik yuz berdi');
    }
  };

  if (loading) return <div className="p-8">Yuklanmoqda...</div>;
  if (!book) return <div className="p-8">Kitob topilmadi</div>;

  const imgSrc = book.cover_image?.startsWith('http')
    ? book.cover_image
    : `http://localhost${book.cover_image}`;

  return (
    <div className="min-h-screen bg-gray-50">


      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 flex gap-8">
          <div className="w-64 shrink-0">
            <img src={imgSrc} alt={book.title} className="w-full rounded-lg" />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
            <p className="text-gray-500 mb-4">
              {book.authors?.map((a) => a.full_name).join(', ')}
            </p>

            <div className="flex items-center gap-3 mb-4">
              {book.discount_price ? (
                <>
                  <span className="text-2xl font-bold text-orange-600">{book.discount_price} so'm</span>
                  <span className="text-gray-400 line-through">{book.price} so'm</span>
                </>
              ) : (
                <span className="text-2xl font-bold text-gray-900">{book.price} so'm</span>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-1">
              Nashriyot: {book.publisher_name || '—'}
            </p>
            <p className="text-sm text-gray-600 mb-1">Sahifalar soni: {book.pages}</p>
            <p className="text-sm text-gray-600 mb-4">
              {book.in_stock ? `Omborda: ${book.stock} dona` : 'Sotuvda yo\'q'}
            </p>

            <p className="text-gray-700 mb-6">{book.description}</p>

            {message && <p className="text-green-600 text-sm mb-3">{message}</p>}

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max={book.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-16 border rounded px-2 py-2 text-center"
              />
              <button
                onClick={handleAddToCart}
                disabled={!book.in_stock}
                className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 disabled:bg-gray-300"
              >
                Savatga qo'shish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}