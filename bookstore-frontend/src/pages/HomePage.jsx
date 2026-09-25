import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import BookCard from '../components/BookCard';
import { getBooks, getCategories } from '../services/books';

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data.results || res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    getBooks({ search })
      .then((res) => setBooks(res.data.results || res.data))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50">


      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        <aside className="w-48 shrink-0">
          <h3 className="font-semibold mb-3 text-gray-700">Kategoriyalar</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {categories.map((cat) => (
              <li key={cat.id} className="hover:text-orange-600 cursor-pointer">
                {cat.name}
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1">
          <h2 className="text-xl font-bold mb-4">
            {search ? `"${search}" bo'yicha natijalar` : 'Barcha kitoblar'}
          </h2>

          {loading ? (
            <p className="text-gray-500">Yuklanmoqda...</p>
          ) : books.length === 0 ? (
            <p className="text-gray-500">Kitob topilmadi</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}