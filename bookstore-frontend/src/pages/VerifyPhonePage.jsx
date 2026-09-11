import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyPhonePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { verifyPhone, resendOTP } = useAuth();

  const phone_number =
    location.state?.phone_number ||
    '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');

    try {
      await verifyPhone(
        phone_number,
        code
      );

      setMessage(
        'Telefon raqami tasdiqlandi!'
      );

      setTimeout(() => {
        navigate('/login', {
          state: {
            phone_number,
          },
        });
      }, 800);

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
          'OTP tekshirishda xatolik yuz berdi'
        );
      }
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');

    try {
      await resendOTP(phone_number);

      setMessage(
        'Yangi OTP yuborildi.'
      );
    } catch (err) {
      setError(
        'OTPni qayta yuborishda xatolik yuz berdi'
      );
    }
  };

  if (!phone_number) {
    return (
      <div className="text-center mt-20">
        <p>
          Telefon raqami topilmadi.
        </p>

        <button
          onClick={() => navigate('/register')}
          className="text-blue-600 mt-4"
        >
          Ro'yxatdan o'tish
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">
          Telefonni tasdiqlash
        </h1>

        <p className="text-sm text-gray-600 text-center mb-6">
          {phone_number} raqamiga yuborilgan
          6 xonali OTP kodni kiriting.
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4">
            {error}
          </p>
        )}

        {message && (
          <p className="text-green-600 text-sm mb-4">
            {message}
          </p>
        )}

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          value={code}
          onChange={(e) =>
            setCode(
              e.target.value.replace(/\D/g, '')
            )
          }
          className="w-full border rounded px-3 py-2 mb-4 text-center tracking-widest"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Tasdiqlash
        </button>

        <button
          type="button"
          onClick={handleResend}
          className="w-full text-blue-600 mt-4"
        >
          OTPni qayta yuborish
        </button>
      </form>
    </div>
  );
}