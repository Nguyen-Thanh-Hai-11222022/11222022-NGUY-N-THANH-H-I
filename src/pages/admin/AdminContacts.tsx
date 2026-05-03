import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { toast } from 'sonner';
import { Check, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminContacts() {
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const snap = await getDocs(collection(db, 'contacts'));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => b.createdAt - a.createdAt);
        setContacts(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'contacts');
      }
    };
    fetchContacts();
  }, []);

  const markReplied = async (id: string) => {
    try {
      await updateDoc(doc(db, 'contacts', id), { status: 'Đã trả lời', updatedAt: Date.now() });
      setContacts(contacts.map(c => c.id === id ? { ...c, status: 'Đã trả lời' } : c));
      toast.success('Đã đánh dấu là đã trả lời');
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, `contacts/${id}`);
    }
  };

  const deleteContact = async (id: string) => {
      if (!confirm('Xóa tin nhắn này?')) return;
      try {
         await deleteDoc(doc(db, 'contacts', id));
         setContacts(contacts.filter(c => c.id !== id));
         toast.success('Đã xóa tin nhắn');
      } catch (error) {
         handleFirestoreError(error, OperationType.DELETE, `contacts/${id}`);
      }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between">
        <h3 className="text-lg font-bold text-gray-900">Quản lý Liên hệ</h3>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày gửi</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Người gửi</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nội dung</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map(c => {
                  const date = typeof c.createdAt === 'number' ? new Date(c.createdAt) : c.createdAt?.toDate();
                  return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {date ? format(date, 'dd/MM/yyyy HH:mm') : ''}
                  </td>
                  <td className="py-4 px-6 text-sm">
                     <div className="font-medium text-gray-900">{c.name}</div>
                     <div className="text-gray-500 text-xs">{c.email}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700 max-w-sm">
                     <p className="truncate" title={c.message}>{c.message}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-center">
                     <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                        ${c.status === 'Chờ xử lý' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-green-50 text-green-700 border-green-200'}
                     `}>
                        {c.status}
                     </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-right space-x-2">
                    {c.status === 'Chờ xử lý' && (
                          <button onClick={() => markReplied(c.id)} className="text-blue-600 hover:text-blue-800 transition" title="Đánh dấu đã trả lời">
                             <Check className="w-5 h-5 inline" />
                          </button>
                    )}
                    <button onClick={() => deleteContact(c.id)} className="text-red-400 hover:text-red-600 transition" title="Xóa">
                        <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              )})}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">Chưa có liên hệ nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
