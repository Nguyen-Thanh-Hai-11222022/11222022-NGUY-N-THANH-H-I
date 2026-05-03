import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import TourCard from '../components/TourCard';
import { useSearchParams } from 'react-router-dom';
import { Filter } from 'lucide-react';

export default function TourList() {
  const [tours, setTours] = useState<any[]>([]);
  const [filteredTours, setFilteredTours] = useState<any[]>([]);
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');

  const regions = ['All', 'Miền Bắc', 'Miền Trung', 'Miền Nam'];
  const tags = ['All', 'Hot', 'Mới', 'Khuyến mãi'];

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const q = query(collection(db, 'tours'), where('isHidden', '==', false));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTours(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'tours');
      }
    };
    fetchTours();
  }, []);

  useEffect(() => {
    let result = tours;

    if (searchTerm) {
      const lowerQ = searchTerm.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(lowerQ) || t.description.toLowerCase().includes(lowerQ));
    }

    if (selectedRegion !== 'All') {
      result = result.filter(t => t.region === selectedRegion);
    }

    if (selectedTag !== 'All') {
      result = result.filter(t => t.tags && t.tags.includes(selectedTag));
    }

    setFilteredTours(result);
  }, [tours, searchTerm, selectedRegion, selectedTag]);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar / Filters */}
          <aside className="w-full md:w-64 space-y-8 flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 mb-6 text-gray-900 border-b pb-4">
                <Filter className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold">Bộ lọc</h2>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Tìm kiếm</h3>
                <input 
                  type="text" 
                  placeholder="Tên tour..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Khu vực</h3>
                <div className="space-y-2">
                  {regions.map(region => (
                    <label key={region} className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="region"
                        checked={selectedRegion === region}
                        onChange={() => setSelectedRegion(region)}
                        className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-gray-700 text-sm">{region === 'All' ? 'Tất cả khu vực' : region}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Nổi bật</h3>
                <div className="space-y-2">
                  {tags.map(tag => (
                    <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="tag"
                        checked={selectedTag === tag}
                        onChange={() => setSelectedTag(tag)}
                        className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-gray-700 text-sm">{tag === 'All' ? 'Tất cả' : tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => { setSearchTerm(''); setSelectedRegion('All'); setSelectedTag('All'); }}
                className="w-full mt-6 text-sm text-blue-600 hover:text-blue-800 font-medium transition"
              >
                Xóa bộ lọc
              </button>
            </div>
          </aside>

          {/* Tour Grid */}
          <main className="flex-1">
            <div className="mb-6 flex justify-between items-end">
              <h1 className="text-2xl font-bold text-gray-900">Danh sách Tour</h1>
              <p className="text-gray-500 text-sm">Tìm thấy {filteredTours.length} tour</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTours.map(tour => (
                <TourCard key={tour.id} {...tour} />
              ))}
            </div>

            {filteredTours.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 mt-6">
                <p className="text-gray-500 text-lg">Không tìm thấy tour nào phù hợp với bộ lọc của bạn.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
