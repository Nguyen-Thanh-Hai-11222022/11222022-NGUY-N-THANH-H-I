import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Map, ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '../store/useCartStore';

export default function MainLayout() {
  const { user, role } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F9F7F2] text-[#1A3A34]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F9F7F2]/90 backdrop-blur-md pt-4 pb-4 md:pt-8 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl md:text-3xl font-semibold tracking-tight serif italic pr-4 border-r border-[#1A3A34]/20">
                Du Lịch Việt
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
                <Link to="/tours" className="hover:opacity-100 transition-opacity">Tours</Link>
                <Link to="/news" className="hover:opacity-100 transition-opacity">Tin Tức</Link>
                <Link to="/contact" className="hover:opacity-100 transition-opacity">Liên Hệ</Link>
              </nav>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/cart" className="relative hover:opacity-70 transition-opacity flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              {user ? (
                <div className="flex items-center gap-6">
                  {role === 'admin' && (
                    <Link to="/admin" className="text-[10px] font-bold uppercase tracking-widest admin-pill px-4 py-2 rounded-full hover:bg-[rgba(212,175,55,0.2)] transition">
                      Quản Trị
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-[10px] font-bold uppercase tracking-widest border-b border-transparent hover:border-current pb-1 transition-colors">
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-[10px] font-bold uppercase tracking-widest border-b border-current pb-1 hover:opacity-70 transition-opacity">
                  Đăng nhập
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <Link to="/cart" className="relative">
                <ShoppingCart className="w-5 h-5" />
                 {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#F9F7F2] border-t border-[#1A3A34]/10 shadow-lg">
            <div className="px-4 py-4 flex flex-col gap-4 text-xs font-bold uppercase tracking-[0.2em]">
              <Link to="/tours" className="block py-2 opacity-70 hover:opacity-100">Tours</Link>
              <Link to="/news" className="block py-2 opacity-70 hover:opacity-100">Tin Tức</Link>
              <Link to="/contact" className="block py-2 opacity-70 hover:opacity-100">Liên Hệ</Link>
              {user ? (
                <>
                  {role === 'admin' && <Link to="/admin" className="block py-2 text-[#D4AF37]">Quản Trị</Link>}
                  <button onClick={handleLogout} className="block text-left py-2 text-red-600/80">Đăng xuất</button>
                </>
              ) : (
                <Link to="/login" className="block py-2">Đăng nhập</Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 gap-4 text-center md:text-left">
          <div>© {new Date().getFullYear()} Du Lịch Việt - Bản quyền thuộc về VN Travel Group</div>
          <div className="flex gap-8">
             <span className="cursor-pointer hover:opacity-100">Instagram</span>
             <span className="cursor-pointer hover:opacity-100">Facebook</span>
             <span className="cursor-pointer hover:opacity-100">LinkedIn</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
