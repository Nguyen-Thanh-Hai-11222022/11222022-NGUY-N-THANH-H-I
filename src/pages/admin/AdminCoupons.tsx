import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { Edit2, Trash2, Eye, EyeOff, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: 0,
    isActive: true
  });

  const fetchCoupons = async () => {
    try {
      const snap = await getDocs(collection(db, 'coupons'));
      setCoupons(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => b.createdAt - a.createdAt));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'coupons');
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const deleteCoupon = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã này?')) return;
    try {
      await deleteDoc(doc(db, 'coupons', id));
      setCoupons(coupons.filter(c => c.id !== id));
      toast.success('Xóa mã thành công');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `coupons/${id}`);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'coupons', id), { isActive: !currentStatus });
      setCoupons(coupons.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `coupons/${id}`);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      code: '',
      discountPercentage: 10,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      code: item.code || '',
      discountPercentage: item.discountPercentage || 0,
      isActive: item.isActive ?? true
    });
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || formData.discountPercentage <= 0 || formData.discountPercentage > 100) {
      toast.error('Dữ liệu không hợp lệ');
      return;
    }
    
    // Ensure code is uppercase and trimmed
    const finalData = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
    };

    try {
      if (editingItem) {
        await updateDoc(doc(db, 'coupons', editingItem.id), {
          isActive: finalData.isActive,
          discountPercentage: finalData.discountPercentage
        });
        setCoupons(coupons.map(c => c.id === editingItem.id ? { ...c, ...finalData } : c));
        toast.success('Cập nhật mã thành công');
      } else {
        const newDocRef = doc(collection(db, 'coupons'));
        const newItem = {
          ...finalData,
          createdAt: Date.now()
        };
        await setDoc(newDocRef, newItem);
        setCoupons([{ id: newDocRef.id, ...newItem }, ...coupons]);
        toast.success('Thêm mã mới thành công');
      }
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingItem ? OperationType.UPDATE : OperationType.CREATE, editingItem ? `coupons/${editingItem.id}` : 'coupons');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Danh sách Mã giảm giá</h3>
        <div className="flex space-x-3">
           <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm flex items-center">
             <Plus className="w-4 h-4 mr-2" /> Thêm Mã mới
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 uppercase text-xs font-semibold text-gray-500">
                <th className="px-6 py-4">Mã Code</th>
                <th className="px-6 py-4">Giảm giá (%)</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-bold text-gray-900">{coupon.code}</td>
                  <td className="px-6 py-4 font-medium text-red-600">{coupon.discountPercentage}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {coupon.isActive ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <button onClick={() => toggleStatus(coupon.id, coupon.isActive)} className="text-gray-400 hover:text-gray-600 transition" title="Khóa/Mở Khóa">
                        {coupon.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                      <button onClick={() => openEditModal(coupon)} className="text-blue-400 hover:text-blue-600 transition" title="Sửa">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => deleteCoupon(coupon.id)} className="text-red-400 hover:text-red-600 transition" title="Xóa">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">Chưa có mã giảm giá nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">{editingItem ? 'Chỉnh sửa Mã giảm giá' : 'Thêm Mã mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveCoupon} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Mã Code *</label>
                  <input required type="text" value={formData.code} disabled={!!editingItem} placeholder="VD: SUMMER20" maxLength={20} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase disabled:bg-gray-100 disabled:text-gray-500" />
                  {!!editingItem && <p className="text-xs text-gray-500">Mã Code không thể thay đổi sau khi tạo.</p>}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Giảm giá (%) *</label>
                  <input required type="number" min="1" max="100" value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Trạng thái *</label>
                  <select value={formData.isActive ? 'true' : 'false'} onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="true">Hoạt động</option>
                    <option value="false">Khóa</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                  Hủy
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
