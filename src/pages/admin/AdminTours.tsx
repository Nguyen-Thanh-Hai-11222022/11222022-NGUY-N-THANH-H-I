import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { Edit2, Trash2, Eye, EyeOff, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminTours() {
  const [tours, setTours] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    region: 'Miền Bắc',
    price: 0,
    isHidden: false,
    image: '',
    description: ''
  });

  const fetchTours = async () => {
    try {
      const snap = await getDocs(collection(db, 'tours'));
      setTours(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => b.createdAt - a.createdAt));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'tours');
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const toggleVisibility = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'tours', id), { isHidden: !current, updatedAt: Date.now() });
      setTours(tours.map(t => t.id === id ? { ...t, isHidden: !current } : t));
      toast.success('Đã cập nhật trạng thái');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tours/${id}`);
    }
  };

  const deleteTour = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tour này?')) return;
    try {
      await deleteDoc(doc(db, 'tours', id));
      setTours(tours.filter(t => t.id !== id));
      toast.success('Đã xóa tour');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tours/${id}`);
    }
  };

  const openAddModal = () => {
    setEditingTour(null);
    setFormData({
      name: '',
      region: 'Miền Bắc',
      price: 0,
      isHidden: false,
      image: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tour: any) => {
    setEditingTour(tour);
    setFormData({
      name: tour.name || '',
      region: tour.region || 'Miền Bắc',
      price: tour.price || 0,
      isHidden: tour.isHidden || false,
      image: tour.image || '',
      description: tour.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveTour = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTour) {
        await updateDoc(doc(db, 'tours', editingTour.id), {
          ...formData,
          updatedAt: Date.now()
        });
        setTours(tours.map(t => t.id === editingTour.id ? { ...t, ...formData } : t));
        toast.success('Cập nhật tour thành công');
      } else {
        const newTourRef = doc(collection(db, 'tours'));
        const newTour = {
          ...formData,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await setDoc(newTourRef, newTour);
        setTours([{ id: newTourRef.id, ...newTour }, ...tours]);
        toast.success('Thêm tour mới thành công');
      }
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingTour ? OperationType.UPDATE : OperationType.CREATE, editingTour ? `tours/${editingTour.id}` : 'tours');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Quản lý Tour</h3>
        <div className="flex space-x-3">
           <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm flex items-center">
             <Plus className="w-4 h-4 mr-2" /> Thêm Tour
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên Tour</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Khu vực</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá khởi điểm</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tours.map(tour => (
                <tr key={tour.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm">
                    <img src={tour.image} alt={tour.name} className="w-16 h-12 rounded object-cover" />
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900 max-w-xs truncate">{tour.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{tour.region}</td>
                  <td className="py-4 px-6 text-sm font-medium text-blue-600">{tour.price.toLocaleString('vi-VN')} ₫</td>
                  <td className="py-4 px-6 text-sm text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tour.isHidden ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                      {tour.isHidden ? 'Đã ẩn' : 'Hiển thị'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-right space-x-3">
                    <button onClick={() => toggleVisibility(tour.id, tour.isHidden)} className="text-gray-400 hover:text-gray-600 transition" title="Ẩn/Hiện">
                      {tour.isHidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <button onClick={() => openEditModal(tour)} className="text-blue-400 hover:text-blue-600 transition" title="Sửa">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => deleteTour(tour.id)} className="text-red-400 hover:text-red-600 transition" title="Xóa">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {tours.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Chưa có tour nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">{editingTour ? 'Chỉnh sửa Tour' : 'Thêm Tour Mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveTour} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Tên Tour *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Khu vực *</label>
                  <select value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="Miền Bắc">Miền Bắc</option>
                    <option value="Miền Trung">Miền Trung</option>
                    <option value="Miền Nam">Miền Nam</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Giá tiền (VNĐ) *</label>
                  <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Trạng thái *</label>
                  <select value={formData.isHidden ? 'true' : 'false'} onChange={e => setFormData({...formData, isHidden: e.target.value === 'true'})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="false">Hiển thị</option>
                    <option value="true">Ẩn</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">URL Hình ảnh *</label>
                  <input required type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Mô tả chi tiết *</label>
                  <textarea required rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
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
