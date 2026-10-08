import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const notify = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      notify.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(formData);
      notify.success(res.message || 'Account created successfully. Welcome to HOMES2OWN.');
      navigate('/dashboard');
    } catch (err) {
      notify.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      
      <div className="text-center space-y-2">
        <Link to="/" className="inline-block">
          <span className="font-serif text-3xl tracking-widest text-[#242521] font-semibold">
            HOMES<span className="text-[#777B5A]">2</span>OWN
          </span>
        </Link>
        <h1 className="font-serif text-2xl font-light text-[#242521]">
          Register Private Customer Account
        </h1>
        <p className="text-xs text-[#71716D]">
          Curate saved Mumbai properties, compare specifications, and track site visit appointments.
        </p>
      </div>

      <div className="bg-white border border-[#D9D4C9] p-8 rounded-xs shadow-editorial">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-[#242521] mb-1">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#71716D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rohan Singhania"
                className="w-full pl-9 pr-3 py-2 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#242521] mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#71716D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#242521] mb-1">Mobile Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#71716D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98200 00000"
                className="w-full pl-9 pr-3 py-2 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#242521] mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#71716D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3 py-2 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] hover:bg-[#777B5A] transition-colors rounded-xs shadow-subtle disabled:opacity-50"
          >
            {loading ? 'Creating Portfolio...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#F0ECE4] text-center text-xs text-[#71716D]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#242521] font-semibold hover:text-[#777B5A]">
            Sign In here
          </Link>
        </div>
      </div>

    </div>
  );
}
