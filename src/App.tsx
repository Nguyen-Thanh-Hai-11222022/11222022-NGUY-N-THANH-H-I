import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from 'sonner';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Customer Pages
import Home from './pages/Home';
import TourList from './pages/TourList';
import TourDetail from './pages/TourDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import NewsList from './pages/NewsList';
import NewsDetail from './pages/NewsDetail';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTours from './pages/admin/AdminTours';
import AdminOrders from './pages/admin/AdminOrders';
import AdminNews from './pages/admin/AdminNews';
import AdminContacts from './pages/admin/AdminContacts';
import AdminCoupons from './pages/admin/AdminCoupons';

function App() {
  const { setUser, setLoading, isLoading, role } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let userRole: 'admin' | 'customer' = 'customer';
          
          if (userDoc.exists()) {
            userRole = userDoc.data().role as 'admin' | 'customer';
          } else {
            // New user, possibly from Google Sign In
            userRole = user.email === 'haithtttb@gmail.com' ? 'admin' : 'customer';
            await setDoc(userDocRef, {
              name: user.displayName || 'Khách hàng',
              email: user.email,
              role: userRole,
              createdAt: Date.now()
            });
          }

          // Force update if it is the target email but missing admin rights
          if (user.email === 'haithtttb@gmail.com' && userRole !== 'admin') {
            userRole = 'admin';
            await updateDoc(userDocRef, { role: 'admin' });
          }

          setUser(user, userRole);
        } catch (error) {
          console.error("Error fetching user role", error);
          setUser(user, user.email === 'haithtttb@gmail.com' ? 'admin' : 'customer');
        }
      } else {
        setUser(null, null);
      }
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="tours" element={<TourList />} />
          <Route path="tours/:id" element={<TourDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="news" element={<NewsList />} />
          <Route path="news/:id" element={<NewsDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            role === 'admin' ? (
              <AdminLayout />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="tours" element={<AdminTours />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="news" element={<AdminNews />} />
          <Route path="contacts" element={<AdminContacts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
