import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';

interface TourCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  region: string;
  tags: string[];
}

export default function TourCard({ id, name, image, price, region, tags }: TourCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const handleBookNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      tourId: id,
      tourName: name,
      variantName: 'Tiêu chuẩn',
      price: price || 0,
      quantity: 1,
      image: image || ''
    });
    
    navigate('/checkout');
  };

  return (
    <Link to={`/tours/${id}`} className="bg-white p-4 rounded-[32px] border border-stone-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col cursor-pointer">
      <div className="h-44 sm:h-52 rounded-[24px] overflow-hidden mb-4 relative">
        <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={name} />
      </div>
      <div className="flex justify-between items-start mb-2 gap-4">
        <h5 className="font-semibold text-lg leading-tight group-hover:text-[#D4AF37] transition-colors">{name}</h5>
        <span className="text-[#D4AF37] font-bold text-sm sm:text-base whitespace-nowrap">{(price / 1000000).toLocaleString('vi-VN')}tr</span>
      </div>
      <p className="text-xs text-stone-400 leading-relaxed mb-4 flex-1 line-clamp-2">Khám phá vẻ đẹp cùng {name}...</p>
      <div className="flex justify-between items-center mt-auto">
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">3 Ngày 2 Đêm</span>
        </div>
        <button 
          onClick={handleBookNow}
          className="text-[10px] font-bold uppercase tracking-widest bg-[#1A3A34] text-white px-4 py-2 rounded-full hover:bg-[#1A3A34]/90 transition-colors"
        >
          Đặt ngay
        </button>
      </div>
    </Link>
  );
}
