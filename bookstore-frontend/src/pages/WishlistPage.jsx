import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { getImageUrl } from "../utils/media";

export default function WishlistPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/wishlist/");
      setBooks(response.data.books || []);
    } catch (err) {
      console.error("Wishlist error:", err);

      if (err.response?.status === 401) {
        setError("Kitoblaringizni ko‘rish uchun tizimga kiring.");
      } else {
        setError("Kitoblarni yuklashda xatolik yuz berdi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (bookId) => {
    try {
      await api.delete(`/wishlist/remove/${bookId}/`);

      setBooks((prev) =>
        prev.filter((book) => book.id !== bookId)
      );
    } catch (err) {
      console.error("Remove wishlist error:", err);
    }
  };

  const formatPrice = (price) => {
    return (
      new Intl.NumberFormat("uz-UZ").format(price || 0) +
      " so'm"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-8">
            Kitoblarim ❤️
          </h1>

          <p className="text-gray-500">
            Yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <p className="text-red-500 mb-4">
              {error}
            </p>

            <Link
              to="/login"
              className="inline-block bg-orange-600 text-white px-5 py-2 rounded-full"
            >
              Kirish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-8">
            Kitoblarim ❤️
          </h1>

          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <div className="text-6xl mb-5">
              ❤️
            </div>

            <h2 className="text-xl font-semibold mb-2">
              Hozircha saqlangan kitoblar yo‘q
            </h2>

            <p className="text-gray-500 mb-6">
              Yoqtirgan kitoblaringizni shu yerga saqlang.
            </p>

            <Link
              to="/"
              className="inline-block bg-orange-600 text-white px-6 py-3 rounded-full hover:bg-orange-700"
            >
              Kitoblarni ko‘rish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Kitoblarim ❤️
            </h1>

            <p className="text-gray-500 mt-1">
              Saqlangan kitoblaringiz
            </p>
          </div>

          <span className="bg-white px-4 py-2 rounded-full text-sm shadow-sm">
            {books.length} ta kitob
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {books.map((book) => (
            <div
              key={book.id}
              className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <Link to={`/books/${book.slug}`}>
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                  <img
                    src={getImageUrl(book.cover_image)}
                    alt={book.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              </Link>

              <button
                onClick={() => removeFromWishlist(book.id)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-red-500 hover:bg-red-50"
                title="Kitobni olib tashlash"
              >
                ♥
              </button>

              <div className="p-4">
                <Link to={`/books/${book.slug}`}>
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2">
                    {book.title}
                  </h3>
                </Link>

                <div className="flex items-center gap-2">
                  {book.discount_price ? (
                    <>
                      <span className="font-bold text-orange-600">
                        {formatPrice(book.discount_price)}
                      </span>

                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(book.price)}
                      </span>
                    </>
                  ) : (
                    <span className="font-bold">
                      {formatPrice(book.price)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}