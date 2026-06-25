import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function PublicNav() {
  const nav = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `font-medium px-5 py-2 rounded-lg transition-colors ${isActive(path)
      ? 'bg-[#1e3a8a] text-white shadow-sm'
      : scrolled
        ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        : 'text-gray-200 hover:text-white hover:bg-white/10'
    }`;

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'background 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease',
        background: scrolled
          ? 'rgba(255,255,255,0.97)'
          : 'rgba(15, 37, 84, 0.4)',
        backdropFilter: scrolled ? 'blur(0px)' : 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(229,231,235,1)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">

          {/* Logo */}
          <div className="flex items-center gap-2 z-10">
            <Link
              to="/"
              style={{
                fontSize: '1.4rem',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                color: scrolled ? '#111827' : '#ffffff',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
              }}
            >
              ShortStay
            </Link>
          </div>

          {/* Nav links — perfectly centered */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-2">
            <Link to="/" className={linkClass('/')}>Home</Link>
            <Link to="/about" className={linkClass('/about')}>About</Link>
            <Link to="/contact" className={linkClass('/contact')}>Contact</Link>
          </div>

          {/* Login button */}
          <div className="hidden md:flex items-center z-10">
            <button
              onClick={() => nav('/login')}
              style={{
                background: scrolled
                  ? 'linear-gradient(135deg, #1e3a8a, #1d4ed8)'
                  : 'rgba(255,255,255,0.15)',
                border: scrolled ? 'none' : '1px solid rgba(255,255,255,0.3)',
                color: '#ffffff',
                padding: '8px 24px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: scrolled ? 'none' : 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = scrolled
                  ? '0 4px 14px rgba(30,58,138,0.4)'
                  : '0 4px 14px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Log In
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
