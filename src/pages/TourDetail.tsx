import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useCartStore } from '../store/useCartStore';
import { toast } from 'sonner';
import { MapPin, Clock, CheckCircle } from 'lucide-react';

export default function TourDetail() {
  const { id } = useParams<{ id: string }>();
  const [tour, setTour] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTour = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'tours', id));
        if (docSnap.exists() && !docSnap.data().isHidden) {
          const data = { id: docSnap.id, ...docSnap.data() } as any;
          setTour(data);
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          } else {
             setSelectedVariant({ name: 'Tiêu chuẩn', price: data.price || 0, description: 'Tour tiêu chuẩn' });
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `tours/${id}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTour();
  }, [id]);

  const handleAddToCart = () => {
    if (!tour) return;
    
    // Safety check fallback
    const variant = selectedVariant || { name: 'Tiêu chuẩn', price: tour.price || 0 };

    addItem({
      tourId: tour.id,
      tourName: tour.name,
      variantName: variant.name,
      price: variant.price,
      quantity: 1,
      image: tour.image || ''
    });
    
    navigate('/checkout');
  };

  if (isLoading) return <div className="min-h-screen flex justify-center items-center">Đang tải...</div>;
  if (!tour) return <div className="min-h-screen flex justify-center items-center">Không tìm thấy tour.</div>;

  return (
    <div className="bg-gray-50 min-h-[80vh] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Image */}
            <div className="relative h-[400px] lg:h-full">
              <img src={tour.image} alt={tour.name} className="absolute inset-0 w-full h-full object-cover" />
            </div>

            {/* Content */}
            <div className="p-8 lg:p-12 flex flex-col">
              <div className="flex gap-2 mb-4">
                 {tour.tags && tour.tags.map((tag: string) => (
                    <span key={tag} className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">{tag}</span>
                 ))}
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{tour.name}</h1>
              
              <div className="flex items-center space-x-6 text-gray-500 mb-8">
                <span className="flex items-center"><MapPin className="w-5 h-5 mr-2" /> {tour.region}</span>
                <span className="flex items-center"><Clock className="w-5 h-5 mr-2" /> 3 Ngày 2 Đêm</span>
              </div>

              <div className="prose prose-blue max-w-none text-gray-600 mb-8">
                <p>{tour.description}</p>
                <ul className="mt-4 space-y-2">
                   <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2"/> Đảm bảo khởi hành</li>
                   <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2"/> Hướng dẫn viên nhiệt tình</li>
                   <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2"/> Bảo hiểm du lịch</li>
                </ul>
              </div>

              {tour.variants && tour.variants.length > 0 && (
                 <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 mb-4">Chọn gói Tour</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {tour.variants.map((v: any) => (
                          <button
                             key={v.name}
                             onClick={() => setSelectedVariant(v)}
                             className={`p-4 rounded-xl border-2 text-left transition ${
                                selectedVariant?.name === v.name ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                             }`}
                          >
                             <div className="font-semibold text-gray-900">{v.name}</div>
                             <div className="text-sm text-gray-500 mb-2">{v.description}</div>
                             <div className="font-bold text-blue-600">{v.price.toLocaleString('vi-VN')} ₫</div>
                          </button>
                       ))}
                    </div>
                 </div>
              )}

              <div className="mt-auto pt-8 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Giá tổng cộng</span>
                  <span className="text-3xl font-bold text-blue-600">
                    {selectedVariant ? selectedVariant.price.toLocaleString('vi-VN') : (tour.price || 0).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="bg-[#1A3A34] hover:bg-[#1A3A34]/90 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg"
                >
                  Đặt ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
