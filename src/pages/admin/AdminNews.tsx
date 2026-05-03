import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { Edit2, Trash2, Eye, EyeOff, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminNews() {
  const [news, setNews] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    isPublished: true,
    summary: '',
    content: ''
  });

  const fetchNews = async () => {
    try {
      const snap = await getDocs(collection(db, 'news'));
      setNews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => b.createdAt - a.createdAt));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'news');
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const toggleVisibility = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'news', id), { isPublished: !current, updatedAt: Date.now() });
      setNews(news.map(t => t.id === id ? { ...t, isPublished: !current } : t));
      toast.success('Đã cập nhật trạng thái');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `news/${id}`);
    }
  };

  const deleteNews = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin này?')) return;
    try {
      await deleteDoc(doc(db, 'news', id));
      setNews(news.filter(t => t.id !== id));
      toast.success('Đã xóa tin');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `news/${id}`);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      image: '',
      isPublished: true,
      summary: '',
      content: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      image: item.image || '',
      isPublished: item.isPublished ?? true,
      summary: item.summary || '',
      content: item.content || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'news', editingItem.id), {
          ...formData,
          updatedAt: Date.now()
        });
        setNews(news.map(t => t.id === editingItem.id ? { ...t, ...formData } : t));
        toast.success('Cập nhật tin thành công');
      } else {
        const newItemRef = doc(collection(db, 'news'));
        const newItem = {
          ...formData,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await setDoc(newItemRef, newItem);
        setNews([{ id: newItemRef.id, ...newItem }, ...news]);
        toast.success('Thêm tin mới thành công');
      }
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingItem ? OperationType.UPDATE : OperationType.CREATE, editingItem ? `news/${editingItem.id}` : 'news');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Quản lý Tin tức</h3>
        <div className="flex space-x-3">
           <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm flex items-center">
             <Plus className="w-4 h-4 mr-2" /> Thêm Bài viết
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {news.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm">
                    <img src={item.image} alt={item.title} className="w-16 h-12 rounded object-cover" />
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900 max-w-xs truncate">{item.title}</td>
                  <td className="py-4 px-6 text-sm text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${!item.isPublished ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                      {!item.isPublished ? 'Bản nháp' : 'Đã xuất bản'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-right space-x-3">
                    <button onClick={() => toggleVisibility(item.id, item.isPublished)} className="text-gray-400 hover:text-gray-600 transition" title="Ẩn/Hiện">
                      {item.isPublished ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <button onClick={() => openEditModal(item)} className="text-blue-400 hover:text-blue-600 transition" title="Sửa">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => deleteNews(item.id)} className="text-red-400 hover:text-red-600 transition" title="Xóa">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {news.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">Chưa có bài viết nào.</td>
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
              <h2 className="text-xl font-bold text-gray-900">{editingItem ? 'Chỉnh sửa Tin tức' : 'Thêm Bài viết Mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveNews} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Tiêu đề *</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Trạng thái *</label>
                    <select value={formData.isPublished ? 'true' : 'false'} onChange={e => setFormData({...formData, isPublished: e.target.value === 'true'})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                      <option value="true">Xuất bản</option>
                      <option value="false">Bản nháp</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">URL Hình ảnh *</label>
                    <input required type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Tóm tắt *</label>
                  <textarea required rows={2} value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Nội dung chi tiết *</label>
                  <textarea required rows={8} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
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
