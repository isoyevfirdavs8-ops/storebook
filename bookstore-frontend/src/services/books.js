import api from './api';

export const getBooks = (params = {}) => api.get('/books/', { params });
export const getBook = (slug) => api.get(`/books/${slug}/`);
export const getCategories = () => api.get('/categories/');