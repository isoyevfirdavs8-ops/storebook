import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { login } = useAuth();

  const [form, setForm] = useState({
    phone_number:
      location.state?.phone_number || '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    try {
      await login(
        form.phone_number,
        form.password
      );

      navigate('/');

    } catch (err) {
      const data = err.response?.data;

      if (data) {
        const firstField =
          Object.keys(data)[0];

        const firstError =
          Object.values(data)[0];

        setError(
          Array.isArray(firstError)
            ? firstError[0]
            : firstError
        );
      } else {
        setError(
          'Login qilishda xatolik yuz berdi'
        );
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          Kirish
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-4">
            {error}
          </p>
        )}

        <input
          name="phone_number"
          placeholder="+998901234567"
          value={form.phone_number}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-4"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Parol"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-4"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Kirish
        </button>

        <p className="text-sm text-center mt-4">
          Akkountingiz yo'q?{' '}
          <Link
            to="/register"
            className="text-blue-600"
          >
            Ro'yxatdan o'tish
          </Link>
        </p>
      </form>
    </div>
  );
}