import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

export default function NewsList() {
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const q = query(collection(db, 'news'), where('isPublished', '==', true));
        const snap = await getDocs(q);
        setNews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a:any, b:any) => b.createdAt - a.createdAt));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'news');
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Tin tức & Cẩm nang du lịch</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map(item => {
             const date = typeof item.createdAt === 'number' ? new Date(item.createdAt) : item.createdAt?.toDate();
             return (
               <Link key={item.id} to={`/news/${item.id}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                 <div className="aspect-video overflow-hidden">
                    <img src={item.image || 'https://loremflickr.com/800/400/vietnam'} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                 </div>
                 <div className="p-6">
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                       <Calendar className="w-4 h-4 mr-1" />
                       {date ? format(date, 'dd/MM/yyyy') : ''}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition">{item.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{item.content.replace(/<[^>]+>/g, '')}</p>
                 </div>
               </Link>
             )
          })}
        </div>

        {news.length === 0 && (
           <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-100">
             Đang cập nhật tin tức...
           </div>
        )}
      </div>
    </div>
  );
}
