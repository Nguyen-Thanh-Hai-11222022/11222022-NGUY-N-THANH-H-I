import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const snap = await getDocs(collection(db, 'orders'));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => b.createdAt - a.createdAt);
        setOrders(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      }
    };
    fetchOrders();
  }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status, updatedAt: Date.now() });
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      toast.success('Đã cập nhật trạng thái đơn hàng');
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
    }
  };

  const getStatusIcon = (status: string) => {
     switch (status) {
        case 'Chờ xử lý': return <Clock className="w-4 h-4 text-orange-500 mr-1" />;
        case 'Đã xác nhận': return <CheckCircle className="w-4 h-4 text-green-500 mr-1" />;
        case 'Đã hủy': return <XCircle className="w-4 h-4 text-red-500 mr-1" />;
        default: return null;
     }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Quản lý Đơn hàng</h3>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã đơn / Ngày đặt</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tour</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => {
                  const date = typeof order.createdAt === 'number' ? new Date(order.createdAt) : order.createdAt?.toDate();
                  return (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm">
                    <div className="font-mono text-gray-900 font-medium mb-1">{order.id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-gray-500 text-xs">
                       {date ? format(date, 'dd/MM/yyyy HH:mm') : ''}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm">
                     <div className="font-medium text-gray-900">{order.customerName}</div>
                     <div className="text-gray-500 text-xs">{order.customerPhone}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                     <ul className="list-disc pl-4">
                        {order.items.map((item: any, idx: number) => (
                           <li key={idx} className="truncate max-w-[200px]" title={item.tourName}>{item.tourName} ({item.quantity})</li>
                        ))}
                     </ul>
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-blue-600">
                      {order.finalAmount?.toLocaleString('vi-VN')} ₫
                      <div className="text-xs text-gray-500 font-normal mt-1">{order.paymentMethod}</div>
                  </td>
                  <td className="py-4 px-6 text-sm">
                     <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                        ${order.status === 'Chờ xử lý' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                        ${order.status === 'Đã xác nhận' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                        ${order.status === 'Đã hủy' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                     `}>
                        {getStatusIcon(order.status)} {order.status}
                     </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-right space-x-2">
                    {order.status === 'Chờ xử lý' && (
                       <>
                          <button onClick={() => updateOrderStatus(order.id, 'Đã xác nhận')} className="text-green-600 hover:text-green-800 transition text-xs font-medium bg-green-50 px-2 py-1 rounded">
                             Xác nhận
                          </button>
                          <button onClick={() => updateOrderStatus(order.id, 'Đã hủy')} className="text-red-600 hover:text-red-800 transition text-xs font-medium bg-red-50 px-2 py-1 rounded">
                             Hủy bỏ
                          </button>
                       </>
                    )}
                  </td>
                </tr>
              )})}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Chưa có đơn hàng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
