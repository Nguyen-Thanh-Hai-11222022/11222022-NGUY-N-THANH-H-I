import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { toast } from 'sonner';

export default function Checkout() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: user?.email || '',
    customerPhone: '',
    customerAddress: '',
  });
  
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Coupon states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, percentage: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? (totalAmount * appliedCoupon.percentage) / 100 : 0;
  const finalAmount = Math.max(0, totalAmount - discountAmount);
  
  useEffect(() => {
    // If the cart gets cleared or empty, ensure coupon returns to none
    if (items.length === 0) {
      setAppliedCoupon(null);
    }
  }, [items.length]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    
    setIsApplyingCoupon(true);
    setCouponError('');
    setCouponSuccess('');
    
    try {
      const q = query(collection(db, 'coupons'), where('code', '==', couponInput.trim().toUpperCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setCouponError('Mã không hợp lệ hoặc đã hết hạn');
        setAppliedCoupon(null);
      } else {
        const couponDoc = snap.docs[0].data();
        if (!couponDoc.isActive) {
          setCouponError('Mã không hợp lệ hoặc đã khóa');
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon({
            code: couponDoc.code,
            percentage: couponDoc.discountPercentage
          });
          setCouponSuccess(`Đã áp dụng mã giảm ${couponDoc.discountPercentage}%`);
        }
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Không thể xác thực mã lúc này');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  if (!user) {
    // You could force login here, but let's just warn or allow if the rule allows.
    // Our rule says: `allow create: if isSignedIn()`, so user MUST be logged in.
    return (
       <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
          <h2 className="text-xl font-bold mb-4">Bạn cần đăng nhập để đặt Tour</h2>
          <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700">Đăng nhập ngay</button>
       </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderRef = doc(collection(db, 'orders'));
      
      const orderData = {
        userId: user.uid,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        totalAmount,
        discountAmount,
        finalAmount,
        paymentMethod,
        status: 'Chờ xử lý',
        items: items,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await setDoc(orderRef, orderData);
      
      if (paymentMethod === 'VNPay') {
         // Simulate VNPay redirect
         toast.success('Chuyển hướng đến VNPay...');
         setTimeout(() => {
            toast.success('Thanh toán VNPay thành công!');
            clearCart();
            navigate('/', { replace: true });
         }, 2000);
      } else {
         toast.success('Đặt tour thành công!');
         clearCart();
         navigate('/', { replace: true });
      }

    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin liên hệ</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                  <input required type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input required type="email" value={formData.customerEmail} onChange={e => setFormData({...formData, customerEmail: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                  <input required type="tel" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ (Tùy chọn)</label>
                  <input type="text" value={formData.customerAddress} onChange={e => setFormData({...formData, customerAddress: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Phương thức thanh toán</h2>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                  <span className="font-medium text-gray-900">Thanh toán tại văn phòng (Tiền mặt / Quẹt thẻ)</span>
                </label>
                <label className="flex items-center space-x-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                  <input type="radio" name="payment" value="VNPay" checked={paymentMethod === 'VNPay'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                  <div>
                    <span className="font-medium text-gray-900 block">Thanh toán qua VNPay</span>
                    <span className="text-sm text-gray-500">Hỗ trợ ATM nội địa, QR Code</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-sm h-fit sticky top-24">
             <h3 className="text-xl font-bold mb-6 border-b border-gray-800 pb-4">Tóm tắt đơn đặt tour</h3>
             
             <div className="space-y-4 mb-6 text-sm">
                {items.map((item, idx) => (
                   <div key={idx} className="flex justify-between border-b border-gray-800 pb-4">
                      <div>
                         <p className="font-semibold text-gray-200">{item.tourName}</p>
                         <p className="text-gray-400">Gói: {item.variantName} x {item.quantity}</p>
                      </div>
                      <span className="font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</span>
                   </div>
                ))}
             </div>

             <div className="mb-6">
                <div className="flex gap-2">
                   <input
                     type="text"
                     value={couponInput}
                     onChange={(e) => setCouponInput(e.target.value)}
                     placeholder="Nhập mã giảm giá..."
                     className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                   />
                   <button
                     type="button"
                     onClick={handleApplyCoupon}
                     disabled={isApplyingCoupon || !couponInput.trim()}
                     className="px-4 py-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 rounded-lg font-medium transition-colors text-white disabled:opacity-50"
                   >
                     {isApplyingCoupon ? 'Đang xử lý' : 'Áp dụng'}
                   </button>
                </div>
                {couponError && <p className="text-red-400 text-sm mt-2">{couponError}</p>}
                {couponSuccess && <p className="text-green-400 text-sm mt-2">{couponSuccess}</p>}
             </div>

             <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between text-gray-400">
                   <span>Tạm tính</span>
                   <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
                {discountAmount > 0 && (
                   <div className="flex justify-between text-green-400">
                      <span>Giảm giá</span>
                      <span>-{discountAmount.toLocaleString('vi-VN')} ₫</span>
                   </div>
                )}
             </div>

             <div className="border-t border-gray-800 pt-6 mb-8 flex justify-between items-center">
                <span className="font-bold">Tổng cộng</span>
                <span className="text-3xl font-bold text-blue-400">{finalAmount.toLocaleString('vi-VN')} ₫</span>
             </div>

             <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50">
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt Tour'}
             </button>
             <p className="text-center text-xs text-gray-500 mt-4">
                Bằng việc nhấn đặt tour, bạn đồng ý với Điều khoản và dịch vụ của chúng tôi.
             </p>
          </div>

        </form>
      </div>
    </div>
  );
}
