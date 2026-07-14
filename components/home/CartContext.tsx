import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { HomeProduct } from '@/app/data/home';
import { ApiService } from '@/app/services/apiService';
import { TokenService } from '@/app/services/tokenService';

export type CartItem = {
  id: string;
  product: HomeProduct;
  quantity: number;
  unitPrice: number;
  subTotal: number;
};

type CartContextValue = {
  cartItems: CartItem[];
  addToCart: (product: HomeProduct, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  cartTotal: number;
  subTotal: number;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

type CartProviderProps = {
  children: ReactNode;
};

function parsePrice(price: string) {
  const numericPrice = Number(price.replace(/[^0-9]/g, ''));
  return Number.isNaN(numericPrice) ? 0 : numericPrice;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subTotal, setSubTotal] = useState<number>(0);

  const fetchCart = useCallback(async () => {
    try {
      const token = await TokenService.getAccessToken();
      if (!token) {
        setCartItems([]);
        setSubTotal(0);
        return;
      }
      const res = await ApiService.getCart();
      if (res.success && res.data) {
        setSubTotal(res.data.subTotal || 0);
        const rawItems = res.data.items || [];
        const mappedItems: CartItem[] = rawItems.map((item: any) => {
          const cached = ApiService.getProductFromCache(item.productId) as HomeProduct | null;
          const product: HomeProduct = cached || {
            id: item.productId,
            name: item.productName,
            price: `₦${Number(item.unitPrice).toLocaleString()}`,
            image: { uri: 'https://via.placeholder.com/300/252523/ffffff?text=' + encodeURIComponent(item.productName) },
            description: 'Premium quality product.',
            review: 'Verified build quality access components.',
            availability: item.inStock ? 'In stock - Limited units available' : 'Out of stock',
            delivery: '15 days after payment confirmation',
            colors: ['#C9922A', '#E8E8E8', '#1A1A1A'],
          };
          return {
            id: item.id,
            product,
            quantity: item.quantity,
            unitPrice: item.unitPrice || 0,
            subTotal: item.subTotal || 0,
          };
        });
        setCartItems(mappedItems);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (product: HomeProduct, quantity = 1) => {
    try {
      const res = await ApiService.addToCart(product.id, quantity);
      if (res.success) {
        await fetchCart();
      } else {
        throw new Error(res.message || 'Failed to add item to cart');
      }
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      throw err;
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      const res = await ApiService.deleteCartItem(itemId);
      if (res.success) {
        await fetchCart();
      } else {
        throw new Error(res.message || 'Failed to remove item from cart');
      }
    } catch (err: any) {
      console.error('Error removing from cart:', err);
      throw err;
    }
  }, [fetchCart]);

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      cartTotal: subTotal,
      subTotal,
      refreshCart: fetchCart,
    }),
    [addToCart, cartItems, subTotal, removeFromCart, fetchCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}
