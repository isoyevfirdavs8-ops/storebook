import { Link } from 'react-router-dom';

export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.slug}`} className="group">
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
            {book.authors?.join(', ')}
          </p>
          <div className="flex items-center gap-2">
            {book.discount_price ? (
              <>
                <span className="font-bold text-orange-600">{book.discount_price} so'm</span>
                <span className="text-xs text-gray-400 line-through">{book.price} so'm</span>
              </>
            ) : (
              <span className="font-bold text-gray-900">{book.price} so'm</span>
            )}
          </div>
          {!book.in_stock && (
            <span className="text-xs text-red-500">Tugagan</span>
          )}
        </div>
      </div>
    </Link>
  );
}