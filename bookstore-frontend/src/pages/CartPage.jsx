import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getCart, removeFromCart, checkout } from '../services/cart';

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [provider, setProvider] = useState('click');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadCart = () => {
    setLoading(true);
    getCart()
      .then((res) => setCart(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemove = async (itemId) => {
    await removeFromCart(itemId);
    loadCart();
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await checkout(address, provider);
      navigate(`/my-orders`, { state: { newOrderId: data.id } });
    } catch (err) {
      setError(err.response?.data?.detail || "Buyurtma berishda xatolik yuz berdi");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">

        <p className="text-center py-12 text-gray-500">Yuklanmoqda...</p>
      </div>
    );
  }

  const isEmpty = !cart?.items?.length;

  return (
    <div className="min-h-screen bg-gray-50">


      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Savatcha</h1>

        {isEmpty ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 mb-4">Savatchangiz bo'sh</p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700"
            >
              Kitoblarni ko'rish
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Savatdagi mahsulotlar */}
            <div className="md:col-span-2 space-y-3">
              {cart.items.map((item) => {
                const img = item.book_cover?.startsWith('http')
                  ? item.book_cover
                  : `http://localhost${item.book_cover}`;
                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 flex gap-4 items-center">
                    <img src={img} alt={item.book_title} className="w-16 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.book_title}</h3>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x {item.price} so'm
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-orange-600">{item.subtotal} so'm</p>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-xs text-red-500 hover:underline mt-1"
                      >
                        O'chirish
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Checkout formasi */}
            <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
              <div className="flex justify-between mb-4 text-lg">
                <span className="font-medium">Jami:</span>
                <span className="font-bold text-orange-600">{cart.total_price} so'm</span>
              </div>

              <form onSubmit={handleCheckout} className="space-y-3">
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <textarea
                  placeholder="Yetkazib berish manzili"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={3}
                  required
                />

                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="click">Click</option>
                  <option value="payme">Payme</option>
                </select>

                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white py-2 rounded-full hover:bg-orange-700"
                >
                  Buyurtma berish
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}