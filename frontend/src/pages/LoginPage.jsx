import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Shield, User, Briefcase, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function LoginPage() {
  const { login } = useAuth();
  const notify = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      notify.success(`Welcome back, ${res.user.name}.`);
      
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else if (res.user.role === 'consultant') {
        navigate('/consultant');
      } else {
        navigate(from === '/login' ? '/dashboard' : from);
      }
    } catch (err) {
      notify.error(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Logins
  const handleDemoLogin = async (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setLoading(true);
    try {
      const res = await login(demoEmail, 'Password123!');
      notify.success(`Signed in with Demo ${demoRole} account.`);
      if (demoRole === 'Administrator') navigate('/admin');
      else if (demoRole === 'Consultant') navigate('/consultant');
      else navigate('/dashboard');
    } catch (err) {
      notify.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link to="/" className="inline-block">
          <span className="font-serif text-3xl tracking-widest text-[#242521] font-semibold">
            HOMES<span className="text-[#777B5A]">2</span>OWN
          </span>
        </Link>
        <h1 className="font-serif text-2xl font-light text-[#242521]">
          Sign In to Your Account
        </h1>
        <p className="text-xs text-[#71716D]">
          Access your saved Mumbai properties, enquiries, and private advisory records.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white border border-[#D9D4C9] p-8 rounded-xs shadow-editorial">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-[#242521] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#71716D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#242521] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#71716D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] hover:bg-[#777B5A] transition-colors rounded-xs shadow-subtle disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#F0ECE4] text-center text-xs text-[#71716D]">
          Don&rsquo;t have a private account?{' '}
          <Link to="/register" className="text-[#242521] font-semibold hover:text-[#777B5A]">
            Register as Customer
          </Link>
        </div>
      </div>

      {/* Demo Credentials Fast-Access Panel */}
      <div className="bg-[#EFECE3] border border-[#D9D4C9] p-5 rounded-xs space-y-3 text-xs">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#71716D] block">
          Development Demo Accounts (1-Click Login)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('customer@example.com', 'Customer')}
            className="p-2.5 bg-white border border-[#D9D4C9] hover:border-[#777B5A] rounded-xs text-left transition-all"
          >
            <div className="flex items-center gap-1.5 font-bold text-[#242521]">
              <User className="w-3.5 h-3.5 text-[#777B5A]" />
              Customer
            </div>
            <p className="text-[10px] text-[#71716D] mt-0.5">customer@example.com</p>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('consultant@example.com', 'Consultant')}
            className="p-2.5 bg-white border border-[#D9D4C9] hover:border-[#777B5A] rounded-xs text-left transition-all"
          >
            <div className="flex items-center gap-1.5 font-bold text-[#242521]">
              <Briefcase className="w-3.5 h-3.5 text-[#777B5A]" />
              Consultant
            </div>
            <p className="text-[10px] text-[#71716D] mt-0.5">consultant@example.com</p>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('admin@example.com', 'Administrator')}
            className="p-2.5 bg-white border border-[#D9D4C9] hover:border-[#777B5A] rounded-xs text-left transition-all"
          >
            <div className="flex items-center gap-1.5 font-bold text-[#242521]">
              <Shield className="w-3.5 h-3.5 text-[#777B5A]" />
              Admin
            </div>
            <p className="text-[10px] text-[#71716D] mt-0.5">admin@example.com</p>
          </button>
        </div>
        <p className="text-[10px] text-[#71716D] text-center">
          Default development password for all demo accounts: <code className="text-[#242521]">Password123!</code>
        </p>
      </div>

    </div>
  );
}
