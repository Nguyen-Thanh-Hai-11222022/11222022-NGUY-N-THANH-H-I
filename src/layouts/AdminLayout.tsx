import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { LayoutDashboard, Map as MapIcon, ShoppingBasket, Newspaper, MessageSquare, LogOut, Home, Ticket } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Quản lý Tour', path: '/admin/tours', icon: MapIcon },
    { name: 'Đơn hàng', path: '/admin/orders', icon: ShoppingBasket },
    { name: 'Mã giảm giá', path: '/admin/coupons', icon: Ticket },
    { name: 'Tin tức', path: '/admin/news', icon: Newspaper },
    { name: 'Liên hệ', path: '/admin/contacts', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <span className="text-white text-xl font-bold tracking-tight">Admin Portal</span>
        </div>
        <nav className="flex-1 py-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "flex items-center px-6 py-3 text-sm font-medium transition-colors",
                  isActive ? "bg-blue-600 text-white" : "hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {link.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-800 space-y-2">
           <Link to="/" className="flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white transition">
             <Home className="w-5 h-5 mr-3" />
             Về Website
           </Link>
           <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:text-red-300 transition">
             <LogOut className="w-5 h-5 mr-3" />
             Đăng xuất
           </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white shadow-sm flex items-center px-8">
           <h2 className="text-xl font-semibold text-gray-800">
              {navLinks.find(l => l.path === location.pathname)?.name || 'Quản trị'}
           </h2>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
