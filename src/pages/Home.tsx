import React, { useEffect, useState } from 'react';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import TourCard from '../components/TourCard';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function Home() {
  const [featuredTours, setFeaturedTours] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const q = query(
          collection(db, 'tours'),
          where('isHidden', '==', false),
          limit(6)
        );
        const snapshot = await getDocs(q);
        const toursData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFeaturedTours(toursData);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'tours');
      }
    };
    fetchTours();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tours?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-12 sm:gap-24 pb-20">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mt-4 lg:mt-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-12 lg:col-span-7">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37] mb-4 block">
              Khám Phá Việt Nam
            </span>
            <h1 className="serif text-[50px] sm:text-[64px] md:text-[84px] leading-[0.9] font-light italic mb-8">
              Hành trình di sản,<br/>
              <span className="not-italic font-semibold mt-2 block">trải nghiệm đích thực.</span>
            </h1>

            <form onSubmit={handleSearch} className="flex gap-2 p-2 bg-white rounded-2xl shadow-sm border border-stone-100 max-w-xl">
              <input 
                type="text" 
                placeholder="Tìm kiếm điểm đến..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none w-full"
              />
              <select className="bg-stone-50 px-4 py-3 text-sm rounded-xl focus:outline-none hidden sm:block">
                <option>Khu vực</option>
                <option>Miền Bắc</option>
                <option>Miền Trung</option>
                <option>Miền Nam</option>
              </select>
              <button type="submit" className="bg-[#1A3A34] hover:bg-[#1A3A34]/90 text-white px-6 sm:px-8 py-3 rounded-xl text-sm font-semibold tracking-wide transition">
                Tìm kiếm
              </button>
            </form>
          </div>
          
          <div className="md:col-span-12 lg:col-span-5 h-[300px] lg:h-[350px] rounded-[40px] overflow-hidden relative shadow-2xl mt-8 lg:mt-0">
            <img 
              src="https://loremflickr.com/800/600/vietnam,landscape" 
              alt="Vietnam Landscape" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 image-overlay flex flex-col justify-end p-8 text-white">
              <p className="text-[10px] sm:text-xs font-medium uppercase tracking-widest opacity-80 mb-1">Điểm đến Hot</p>
              <h3 className="serif text-3xl italic">Vịnh Hạ Long, Quảng Ninh</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <h2 className="serif text-3xl sm:text-4xl font-semibold italic">Tour Nổi Bật</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 w-full sm:w-auto custom-scroll">
            <Link to="/tours" className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-[#1A3A34] text-white rounded-full whitespace-nowrap shrink-0">Tất cả</Link>
            <Link to="/tours?region=Miền Bắc" className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-stone-400 hover:bg-stone-200 transition rounded-full whitespace-nowrap shrink-0">Miền Bắc</Link>
            <Link to="/tours?region=Miền Trung" className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-stone-400 hover:bg-stone-200 transition rounded-full whitespace-nowrap shrink-0">Miền Trung</Link>
            <Link to="/tours?region=Miền Nam" className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-stone-400 hover:bg-stone-200 transition rounded-full whitespace-nowrap shrink-0">Miền Nam</Link>
          </div>
        </div>
          
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTours.map((tour) => (
            <TourCard key={tour.id} {...tour} />
          ))}
        </div>
        {featuredTours.length === 0 && (
          <div className="text-center text-stone-400 py-12 border border-dashed border-stone-200 rounded-[32px]">Đang cập nhật tour nổi bật...</div>
        )}
      </section>
    </div>
  );
}
