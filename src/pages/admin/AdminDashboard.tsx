import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { Users, ShoppingBag, Banknote, Map as MapIcon, Database } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalTours: 0,
    totalUsers: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const toursSnap = await getDocs(collection(db, 'tours'));
        const usersSnap = await getDocs(collection(db, 'users'));

        let revenue = 0;
        let orders = 0;
        const recentOrders: any[] = [];

        ordersSnap.forEach(doc => {
          const data = doc.data();
          if (data.status !== 'Đã hủy') {
            revenue += data.finalAmount || 0;
            orders++;
            recentOrders.push(data);
          }
        });

        setStats({
          totalRevenue: revenue,
          totalOrders: orders,
          totalTours: toursSnap.size,
          totalUsers: usersSnap.size
        });

        // Generate last 7 days chart data
        const data = [];
        for (let i = 6; i >= 0; i--) {
          const d = subDays(new Date(), i);
          const dateStr = format(d, 'yyyy-MM-dd');
          const dayName = format(d, 'EEE', { locale: vi });
          
          let dayRevenue = 0;
          recentOrders.forEach(o => {
            if (o.createdAt) {
               // handle milliseconds timestamp
               const orderDate = typeof o.createdAt === 'number' ? new Date(o.createdAt) : o.createdAt.toDate();
               if (format(orderDate, 'yyyy-MM-dd') === dateStr) {
                 dayRevenue += o.finalAmount || 0;
               }
            }
          });
          
          data.push({ name: dayName, DoanhThu: dayRevenue });
        }
        setChartData(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'Multiple collections');
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl mr-4"><Banknote className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString('vi-VN')} ₫</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl mr-4"><ShoppingBag className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Đơn hàng</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl mr-4"><MapIcon className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Số lượng tour</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTours}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-xl mr-4"><Users className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Khách hàng</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Biểu đồ doanh thu 7 ngày qua</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(val) => `${(val/1000000).toFixed(0)}M`} dx={-10} />
              <Tooltip formatter={(value: number) => [`${value.toLocaleString('vi-VN')} ₫`, 'Doanh thu']} />
              <Line type="monotone" dataKey="DoanhThu" stroke="#2563EB" strokeWidth={3} dot={{r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
