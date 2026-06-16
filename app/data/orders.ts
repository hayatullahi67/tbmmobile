import { ImageSourcePropType } from 'react-native';

// ─── Order type — matches your future API response shape ─────────────────────
export type Order = {
  id: string;
  productName: string;
  price: string;
  deliveryDays: number;
  image: ImageSourcePropType;
  status: 'Processing' | 'Shipped' | 'Delivered';
};

// ─── Mock data — replace body of this with an API fetch when backend is ready ─
export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-001',
    productName: 'Mini sit me',
    price: 'N80,000',
    deliveryDays: 15,
    image: require('@/assets/images/Productpic.png'),
    status: 'Processing',
  },
  {
    id: 'ord-002',
    productName: 'Sverom chair',
    price: 'N65,000',
    deliveryDays: 15,
    image: require('@/assets/images/Productpic(1).png'),
    status: 'Shipped',
  },
  {
    id: 'ord-003',
    productName: 'Sverom chair',
    price: 'N65,000',
    deliveryDays: 15,
    image: require('@/assets/images/Productpic(2).png'),
    status: 'Delivered',
  },
];

export const STATUS_COLOR: Record<Order['status'], string> = {
  Processing: '#C9922A',
  Shipped: '#4A90E2',
  Delivered: '#4CAF50',
};
