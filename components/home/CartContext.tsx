import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { HomeProduct } from '@/app/data/home';

export type CartItem = {
  product: HomeProduct;
  quantity: number;
};

type CartContextValue = {
  cartItems: CartItem[];
  addToCart: (product: HomeProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  cartTotal: number;
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

  const addToCart = useCallback((product: HomeProduct, quantity = 1) => {
    setCartItems(currentItems => {
      const existingItem = currentItems.find(item => item.product.id === product.id);

      if (!existingItem) {
        return [...currentItems, { product, quantity }];
      }

      return currentItems.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(currentItems => currentItems.filter(item => item.product.id !== productId));
  }, []);

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + parsePrice(item.product.price) * item.quantity,
        0
      ),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      cartTotal,
    }),
    [addToCart, cartItems, cartTotal, removeFromCart]
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
