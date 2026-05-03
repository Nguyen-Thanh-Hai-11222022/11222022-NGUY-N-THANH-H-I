import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { Trash2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { toast } from 'sonner';

export default function Cart() {
  const { items, removeItem, updateQuantity, discountAmount, couponCode, applyCoupon, removeCoupon } = useCartStore();
  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const navigate = useNavigate();

  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const finalAmount = totalAmount - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setIsApplying(true);
    try {
      const q = query(collection(db, 'coupons'), where('code', '==', couponInput), where('isActive', '==', true));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      } else {
        const coupon = snap.docs[0].data();
        const discount = (totalAmount * coupon.discountPercentage) / 100;
        applyCoupon(coupon.code, discount);
        toast.success(`Đã giảm ${coupon.discountPercentage}%`);
      }
    } catch (error) {
       handleFirestoreError(error, OperationType.LIST, 'coupons');
    } finally {
      setIsApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng của bạn đang trống</h2>
        <Link to="/tours" className="text-blue-600 hover:text-blue-700 font-medium border border-blue-600 px-6 py-2 rounded-full">
          Khám phá Tours
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div key={`${item.tourId}-${item.variantName}-${index}`} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
                {item.image && <img src={item.image} alt={item.tourName} className="w-24 h-24 object-cover rounded-xl" />}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-lg text-gray-900">{item.tourName}</h3>
                  <p className="text-sm text-gray-500 mb-2">Gói: {item.variantName}</p>
                  <p className="font-semibold text-blue-600">{item.price.toLocaleString('vi-VN')} ₫</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.tourId, item.variantName, Math.max(1, item.quantity - 1))} className="px-3 py-1 hover:bg-gray-50 text-gray-600">-</button>
                    <span className="px-4 py-1 font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.tourId, item.variantName, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-50 text-gray-600">+</button>
                  </div>
                  <button onClick={() => removeItem(item.tourId, item.variantName)} className="text-red-400 hover:text-red-600 transition p-2 rounded-full hover:bg-red-50">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Tóm tắt đơn hàng</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              
              {couponCode ? (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá ({couponCode}) <button onClick={removeCoupon} className="text-xs ml-2 text-red-500">Xóa</button></span>
                  <span>-{discountAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    placeholder="Mã giảm giá" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={isApplying || !couponInput}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Áp dụng
                  </button>
                </div>
              )}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-end">
                <span className="font-semibold text-gray-900">Tổng cộng</span>
                <span className="text-2xl font-bold text-blue-600">{Math.max(0, finalAmount).toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            <button onClick={() => navigate('/checkout')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition flex items-center justify-center">
              Tiến hành thanh toán <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
