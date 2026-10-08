import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  User,
  Heart,
  Scale,
  Menu,
  X,
  PhoneCall,
  ChevronDown,
  Building2,
  Shield,
  Briefcase,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComparison } from '../../context/ComparisonContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isConsultant, logout } = useAuth();
  const { count: comparisonCount } = useComparison();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Buy', path: '/properties?transaction_type=Buy' },
    { name: 'Rent', path: '/properties?transaction_type=Rent' },
    { name: 'New Projects', path: '/properties?possession_status=Under%20Construction' },
    { name: 'Commercial', path: '/properties?property_type=Commercial' },
    { name: 'Explore Areas', path: '/explore-mumbai' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F7F5F0]/95 backdrop-blur-md border-b border-[#D9D4C9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Wordmark & Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/logo.jpg"
                alt="HOMES2OWN Logo"
                className="w-12 h-12 object-contain rounded-xs shadow-xs group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="font-serif text-2xl sm:text-3xl tracking-widest text-[#242521] font-semibold leading-tight">
                  HOMES<span className="text-[#777B5A]">2</span>OWN
                </span>
                <span className="text-[10px] tracking-[0.18em] text-[#71716D] uppercase font-sans">
                  Mumbai Advisory • MahaRERA: A011182502918
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center space-x-6 text-sm font-medium text-[#242521]">
              {navLinks.map((link) => {
                const isActive = location.pathname + location.search === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`transition-colors py-1 ${
                      isActive
                        ? 'text-[#777B5A] border-b-2 border-[#777B5A]'
                        : 'text-[#242521] hover:text-[#777B5A]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search Trigger */}
            <Link
              to="/properties"
              className="p-2 text-[#242521] hover:text-[#777B5A] transition-colors rounded hover:bg-[#EFECE3]"
              title="Search Properties"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Comparison Tray Link */}
            <Link
              to="/compare"
              className="relative p-2 text-[#242521] hover:text-[#777B5A] transition-colors rounded hover:bg-[#EFECE3]"
              title="Compare Properties"
            >
              <Scale className="w-5 h-5" />
              {comparisonCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#777B5A] text-white text-[10px] flex items-center justify-center font-bold">
                  {comparisonCount}
                </span>
              )}
            </Link>

            {/* Favourites Link (Customer) */}
            {isAuthenticated && (
              <Link
                to="/dashboard?tab=saved"
                className="p-2 text-[#242521] hover:text-[#777B5A] transition-colors rounded hover:bg-[#EFECE3]"
                title="Saved Properties"
              >
                <Heart className="w-5 h-5" />
              </Link>
            )}

            {/* Secondary CTA: Talk to Consultant */}
            <Link
              to="/contact"
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-[#242521] border border-[#242521] hover:bg-[#242521] hover:text-white transition-all rounded-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Talk to a Consultant
            </Link>

            {/* Primary CTA: Find Your Property */}
            <Link
              to="/properties"
              className="inline-flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] hover:bg-[#777B5A] transition-all rounded-xs shadow-subtle"
            >
              Find Your Property
            </Link>

            {/* User Profile / Login Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xs border border-[#D9D4C9] bg-white text-xs font-medium text-[#242521] hover:border-[#777B5A] transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#777B5A]" />
                  <span className="max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-[#71716D]" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xs bg-white border border-[#D9D4C9] shadow-editorial py-2 z-50">
                    <div className="px-4 py-2 border-b border-[#F0ECE4]">
                      <p className="text-xs font-bold text-[#242521] truncate">{user?.name}</p>
                      <p className="text-[11px] text-[#71716D] capitalize">
                        {user?.role} Account
                      </p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#242521] hover:bg-[#F7F5F0]"
                    >
                      <User className="w-4 h-4 text-[#777B5A]" />
                      Customer Dashboard
                    </Link>

                    {isConsultant && (
                      <Link
                        to="/consultant"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#242521] hover:bg-[#F7F5F0]"
                      >
                        <Briefcase className="w-4 h-4 text-[#777B5A]" />
                        Consultant CRM Portal
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#242521] hover:bg-[#F7F5F0]"
                      >
                        <Shield className="w-4 h-4 text-[#777B5A]" />
                        System Administration
                      </Link>
                    )}

                    <div className="border-t border-[#F0ECE4] mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#242521] hover:text-[#777B5A] transition-colors"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/compare"
              className="relative p-2 text-[#242521]"
              title="Compare"
            >
              <Scale className="w-5 h-5" />
              {comparisonCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#777B5A] text-white text-[10px] flex items-center justify-center font-bold">
                  {comparisonCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#242521] hover:text-[#777B5A]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#D9D4C9] bg-[#F7F5F0] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-[#242521] hover:bg-[#EFECE3] rounded-xs"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="border-t border-[#D9D4C9] pt-3 flex flex-col gap-2">
            <Link
              to="/properties"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] rounded-xs"
            >
              Find Your Property
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-[#242521] border border-[#242521] rounded-xs"
            >
              Talk to a Consultant
            </Link>
            {isAuthenticated ? (
              <div className="pt-2 space-y-1">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-1.5 text-xs text-[#242521] hover:bg-[#EFECE3]"
                >
                  Customer Dashboard
                </Link>
                {isConsultant && (
                  <Link
                    to="/consultant"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-1.5 text-xs text-[#242521] hover:bg-[#EFECE3]"
                  >
                    Consultant CRM Portal
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-1.5 text-xs text-[#242521] hover:bg-[#EFECE3]"
                  >
                    System Administration
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-700"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-medium text-[#242521] border border-[#D9D4C9] bg-white rounded-xs"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
