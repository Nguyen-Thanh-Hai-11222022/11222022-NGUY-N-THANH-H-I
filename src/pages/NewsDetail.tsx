import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { format } from 'date-fns';
import { Calendar, ArrowLeft } from 'lucide-react';

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<any>(null);

  useEffect(() => {
    const fetchNews = async () => {
       if(!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'news', id));
        if (docSnap.exists() && docSnap.data().isPublished) {
           setNews({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `news/${id}`);
      }
    };
    fetchNews();
  }, [id]);

  if (!news) return <div className="min-h-[60vh] flex justify-center items-center">Đang tải...</div>;

  const date = typeof news.createdAt === 'number' ? new Date(news.createdAt) : news.createdAt?.toDate();

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/news" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6 transition">
           <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại danh sách
        </Link>
        <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
           <img src={news.image || 'https://loremflickr.com/1200/600/vietnam'} alt={news.title} className="w-full h-[400px] object-cover" />
           <div className="p-8 md:p-12">
              <div className="flex items-center text-sm text-gray-500 mb-4">
                 <Calendar className="w-4 h-4 mr-2" />
                 {date ? format(date, 'dd/MM/yyyy') : ''}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">{news.title}</h1>
              
              {/* Simulate simple markdown or html content */}
              <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                 {news.content}
              </div>
           </div>
        </article>
      </div>
    </div>
  );
}
