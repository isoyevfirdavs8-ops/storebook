import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
  });

  const [error, setError] = useState('');

  const { register } = useAuth();

  const navigate = useNavigate();

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
      await register(
        form.email,
        form.password,
        form.full_name,
        form.phone_number
      );

      navigate('/verify-phone', {
        state: {
          phone_number: form.phone_number,
        },
      });

    } catch (err) {
      const data = err.response?.data;

      if (data) {
        const firstField = Object.keys(data)[0];
        const firstError = Object.values(data)[0];

        setError(
          `${firstField}: ${
            Array.isArray(firstError)
              ? firstError[0]
              : firstError
          }`
        );
      } else {
        setError(
          "Ro'yxatdan o'tishda xatolik yuz berdi"
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
          Ro'yxatdan o'tish
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-4">
            {error}
          </p>
        )}

        <input
          name="full_name"
          placeholder="To'liq ism"
          value={form.full_name}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-4"
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-4"
          required
        />

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
          Ro'yxatdan o'tish
        </button>

        <p className="text-sm text-center mt-4">
          Akkountingiz bormi?{' '}
          <Link
            to="/login"
            className="text-blue-600"
          >
            Kirish
          </Link>
        </p>
      </form>
    </div>
  );
}