import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { HomeProduct } from '@/app/data/home';
import { ApiService } from '@/app/services/apiService';
import { TokenService } from '@/app/services/tokenService';

type FavoritesContextValue = {
  favoriteIds: string[];
  savedProducts: HomeProduct[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  loading: boolean;
  refreshFavorites: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

type FavoritesProviderProps = {
  children: ReactNode;
};

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [savedMappings, setSavedMappings] = useState<Record<string, string>>({});
  const [savedProducts, setSavedProducts] = useState<HomeProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const token = await TokenService.getAccessToken();
      if (!token) {
        setSavedMappings({});
        setSavedProducts([]);
        setLoading(false);
        return;
      }
      const res = await ApiService.getSavedItems(1, 100);
      const resObj = res as any;
      const items = resObj?.items || resObj?.data?.items || [];
      const mappings: Record<string, string> = {};
      const mappedProducts: HomeProduct[] = [];

      items.forEach((item: any) => {
        mappings[item.productId] = item.id;

        const cached = ApiService.getProductFromCache(item.productId) as HomeProduct | null;
        const product: HomeProduct = cached || {
          id: item.productId,
          name: item.name,
          price: `₦${Number(item.price).toLocaleString()}`,
          image: { uri: item.image || 'https://via.placeholder.com/300/252523/ffffff?text=No+Image' },
          description: 'Saved item from category ' + (item.category || 'general') + '.',
          review: 'Premium quality saved component.',
          availability: 'In stock',
          delivery: '15 days after payment confirmation',
          colors: ['#C9922A', '#E8E8E8', '#1A1A1A'],
        };
        mappedProducts.push(product);
      });

      setSavedMappings(mappings);
      setSavedProducts(mappedProducts);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback(
    (productId: string) => productId in savedMappings,
    [savedMappings]
  );

  const toggleFavorite = useCallback(async (productId: string) => {
    try {
      const savedId = savedMappings[productId];
      if (savedId) {
        // Optimistic UI updates for deletion
        setSavedMappings(prev => {
          const copy = { ...prev };
          delete copy[productId];
          return copy;
        });
        
        const cachedProducts = [...savedProducts];
        const savedProductIndex = savedProducts.findIndex(p => p.id === productId);
        let savedProductBackup: HomeProduct | null = null;
        if (savedProductIndex > -1) {
          savedProductBackup = savedProducts[savedProductIndex];
          setSavedProducts(prev => prev.filter(p => p.id !== productId));
        }

        try {
          const res = await ApiService.deleteSavedItem(savedId);
          const resObj = res as any;
          const isSuccess = resObj?.success !== false;
          if (!isSuccess) {
            throw new Error('API deletion failed');
          }
        } catch (err) {
          // Revert optimistic removal on error
          setSavedMappings(prev => ({ ...prev, [productId]: savedId }));
          if (savedProductBackup) {
            setSavedProducts(cachedProducts);
          }
          throw err;
        }
      } else {
        // Optimistic UI updates for addition
        setSavedMappings(prev => ({ ...prev, [productId]: 'temp-id' }));
        
        try {
          const res = await ApiService.saveItem(productId);
          const resObj = res as any;
          const isSuccess = resObj?.success !== false;
          if (isSuccess) {
            await fetchFavorites();
          } else {
            throw new Error('API save failed');
          }
        } catch (err) {
          // Revert optimistic addition on error
          setSavedMappings(prev => {
            const copy = { ...prev };
            delete copy[productId];
            return copy;
          });
          throw err;
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  }, [savedMappings, savedProducts, fetchFavorites]);

  const favoriteIds = useMemo(() => Object.keys(savedMappings), [savedMappings]);

  const value = useMemo(
    () => ({
      favoriteIds,
      savedProducts,
      isFavorite,
      toggleFavorite,
      loading,
      refreshFavorites: fetchFavorites,
    }),
    [favoriteIds, savedProducts, isFavorite, toggleFavorite, loading, fetchFavorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error('useFavorites must be used inside FavoritesProvider');
  }

  return context;
}
