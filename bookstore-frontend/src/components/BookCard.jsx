import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function BookCard({ book }) {
  const { isAuthenticated } = useAuth();

  const [isWishlist, setIsWishlist] = useState(
    book.is_wishlisted || false
  );

  const [wishlistLoading, setWishlistLoading] = useState(false);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    try {
      setWishlistLoading(true);

      if (isWishlist) {
        await api.delete(
          `/wishlist/remove/${book.id}/`
        );

        setIsWishlist(false);
      } else {
        await api.post("/wishlist/add/", {
          book_id: book.id,
        });

        setIsWishlist(true);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="group relative">
      <Link to={`/books/${book.slug}`}>
        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">

          <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
            <img
              src={book.cover_image}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>

          <div className="p-3">
            <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
              {book.title}
            </h3>

            <p className="text-xs text-gray-500 mb-2">
              {book.authors?.join(", ")}
            </p>

            <div className="flex items-center gap-2">
              {book.discount_price ? (
                <>
                  <span className="font-bold text-orange-600">
                    {book.discount_price} so'm
                  </span>

                  <span className="text-xs text-gray-400 line-through">
                    {book.price} so'm
                  </span>
                </>
              ) : (
                <span className="font-bold text-gray-900">
                  {book.price} so'm
                </span>
              )}
            </div>

            {!book.in_stock && (
              <span className="text-xs text-red-500">
                Tugagan
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        onClick={toggleWishlist}
        disabled={wishlistLoading}
        className={`
          absolute top-3 right-3
          w-9 h-9
          rounded-full
          bg-white
          shadow-md
          flex items-center justify-center
          transition
          ${
            isWishlist
              ? "text-red-500"
              : "text-gray-400 hover:text-red-500"
          }
        `}
        title={
          isWishlist
            ? "Kitoblarimdan olib tashlash"
            : "Kitoblarimga qo‘shish"
        }
      >
        {isWishlist ? "♥" : "♡"}
      </button>
    </div>
  );
}