import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { forgotPassword } from './authSlice';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const [cooldown, setCooldown] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Vui lòng nhập email");
      return;
    }

    if (cooldown) return;

    try {
      setCooldown(true);
      const res = await dispatch(forgotPassword(email)).unwrap(); // unwrap để lấy payload
      toast.success(res.message || "Gửi email thành công!");
      setEmail('');
      setMessage('');
      setTimeout(() => setCooldown(false), 60000); // cooldown 1 phút
    } catch (err) {
      console.error(err);
      setMessage(err?.response?.data?.errors?.email?.[0] || "Gửi email thất bại");
      setCooldown(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-4">Quên mật khẩu</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {message && <p className="text-red-600">{message}</p>}
        <button
          type="submit"
          disabled={cooldown}
          className={`py-2 px-4 rounded font-bold text-white ${cooldown ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {cooldown ? "Đang gửi..." : "Gửi"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
