import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  tourId: string;
  tourName: string;
  variantId?: string; // variant name really, instructions say variantName
  variantName: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  discountAmount: number;
  couponCode: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (tourId: string, variantName: string) => void;
  updateQuantity: (tourId: string, variantName: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      discountAmount: 0,
      couponCode: null,
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.tourId === item.tourId && i.variantName === item.variantName
          );
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.tourId === item.tourId && i.variantName === item.variantName
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (tourId, variantName) =>
        set((state) => ({
          items: state.items.filter((i) => !(i.tourId === tourId && i.variantName === variantName)),
        })),
      updateQuantity: (tourId, variantName, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.tourId === tourId && i.variantName === variantName ? { ...i, quantity } : i
          ),
        })),
      clearCart: () => set({ items: [], discountAmount: 0, couponCode: null }),
      applyCoupon: (code, discount) => set({ couponCode: code, discountAmount: discount }),
      removeCoupon: () => set({ couponCode: null, discountAmount: 0 }),
    }),
    {
      name: 'dulichviet-cart',
    }
  )
);
