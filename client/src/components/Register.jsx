import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) return alert("Пароль слишком короткий!");
    if (formData.password !== formData.confirmPassword) return alert("Пароли не совпадают!");

    try {
      await axios.post('http://localhost:5000/api/auth/register', { 
        email: formData.email, 
        password: formData.password 
      });
      alert("Регистрация успешна!");
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || "Ошибка регистрации");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-black mb-6">Регистрация</h2>
        <div className="space-y-4">
          <input type="email" placeholder="Email" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Пароль" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({...formData, password: e.target.value})} />
          <input type="password" placeholder="Повторите пароль" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
          <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition">Создать аккаунт</button>
        </div>
      </form>
    </div>
  );
}

