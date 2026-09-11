import api from './api';

export const getCart = () => api.get('/cart/');
export const addToCart = (book_id, quantity = 1) =>
  api.post('/cart/add/', { book_id, quantity });
export const removeFromCart = (itemId) => api.delete(`/cart/remove/${itemId}/`);
export const checkout = (delivery_address, provider = 'click') =>
  api.post('/checkout/', { delivery_address, provider });