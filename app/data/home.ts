import { ImageSourcePropType } from 'react-native';

export type HomeCategory = {
  id: string;
  icon: ImageSourcePropType;
  label: string;
};

export type HomeProduct = {
  id: string;
  name: string;
  price: string;
  image: ImageSourcePropType;
  description: string;
  review: string;
  availability: string;
  delivery: string;
  colors: string[];
};

export type HomeNavItem = {
  id: string;
  label: string;
  icon: ImageSourcePropType;
};

export const homeCategories: HomeCategory[] = [
  {
    id: 'featured',
    label: 'Featured',
    icon: require('@/assets/images/star.png'),
  },
  {
    id: 'chairs',
    label: 'Chairs',
    icon: require('@/assets/images/chair2.png'),
  },
  {
    id: 'tables',
    label: 'Tables',
    icon: require('@/assets/images/table.png'),
  },
  {
    id: 'sofas',
    label: 'Sofas',
    icon: require('@/assets/images/sofa.png'),
  },
  {
    id: 'beds',
    label: 'Beds',
    icon: require('@/assets/images/bed.png'),
  },
];

export const latestReleaseProducts: HomeProduct[] = [
  {
    id: 'tbm-001',
    name: 'Bathroom Hardware Accessory',
    price: 'N45,000',
    image: require('@/assets/images/product1.jpeg'),
    description:
      'A premium bathroom hardware accessory set crafted from stainless steel with a brushed gold finish — includes towel bar, robe hook, and toilet paper holder.',
    review:
      'Customers love the solid build quality and the gold finish that elevates any bathroom aesthetic.',
    availability: 'In stock - Limited units available',
    delivery: '15 days after payment confirmation',
    colors: ['#C9922A', '#E8E8E8', '#1A1A1A'],
  },
  {
    id: 'tbm-002',
    name: 'Pull-Out Spring Kitchen Faucet',
    price: 'N78,000',
    image: require('@/assets/images/product2.jpeg'),
    description:
      'A pull-out spring kitchen faucet with a 360° swivel spout, dual spray modes, and a durable stainless steel finish for modern kitchens.',
    review:
      'Reviewers highlight the flexible pull-out hose and the powerful spray mode that makes kitchen cleanup effortless.',
    availability: 'In stock - Limited units available',
    delivery: '15 days after payment confirmation',
    colors: ['#C0C0C0', '#1A1A1A', '#C9922A'],
  },
  {
    id: 'tbm-003',
    name: 'Freestanding Oval Bathtub',
    price: 'N520,000',
    image: require('@/assets/images/product3.jpeg'),
    description:
      'A freestanding oval bathtub in high-gloss acrylic with a smooth interior, anti-slip base, and a classic silhouette that suits luxury bathrooms.',
    review:
      'Customers praise the deep soaking depth and the elegant oval shape that becomes the centerpiece of any bathroom.',
    availability: 'In stock - Limited units available',
    delivery: '15 days after payment confirmation',
    colors: ['#FFFFFF', '#F5F5F5', '#E0E0E0'],
  },
  {
    id: 'tbm-004',
    name: 'Waterfall Kitchen Faucet',
    price: 'N92,000',
    image: require('@/assets/images/product4.jpeg'),
    description:
      'A single-handle waterfall kitchen faucet with a wide spout, ceramic disc cartridge, and a matte black finish for contemporary kitchens.',
    review:
      'Buyers love the smooth waterfall flow and the matte black finish that stays fingerprint-free.',
    availability: 'In stock - Limited units available',
    delivery: '15 days after payment confirmation',
    colors: ['#1A1A1A', '#C0C0C0', '#C9922A'],
  },
  {
    id: 'tbm-005',
    name: 'Smart Wall-Hung Toilet',
    price: 'N380,000',
    image: require('@/assets/images/product5.jpeg'),
    description:
      'A wall-hung smart toilet with auto flush, heated seat, bidet function, and a concealed cistern for a clean, minimal bathroom look.',
    review:
      'Customers highlight the heated seat and bidet function as game-changers for daily comfort.',
    availability: 'In stock - Limited units available',
    delivery: '15 days after payment confirmation',
    colors: ['#FFFFFF', '#F0F0F0', '#1A1A1A'],
  },
  {
    id: 'tbm-006',
    name: 'Textured White Vanity & LED Mirror',
    price: 'N215,000',
    image: require('@/assets/images/product6.jpeg'),
    description:
      'A textured white bathroom vanity with soft-close drawers paired with a backlit LED mirror — a complete bathroom upgrade.',
    review:
      'Reviewers love the textured finish that hides water marks and the LED mirror that provides perfect lighting.',
    availability: 'In stock - Limited units available',
    delivery: '15 days after payment confirmation',
    colors: ['#FFFFFF', '#F5F5F5', '#C9922A'],
  },
  {
    id: 'tbm-007',
    name: 'Compact Floating Vanity with Mirror Cabinet',
    price: 'N185,000',
    image: require('@/assets/images/product7.jpeg'),
    description:
      'A compact wall-mounted floating vanity with an integrated mirror cabinet, soft-close hinges, and a walnut wood finish.',
    review:
      'Customers appreciate the space-saving design and the mirror cabinet that provides hidden storage.',
    availability: 'In stock - Limited units available',
    delivery: '15 days after payment confirmation',
    colors: ['#7B5E3A', '#D4C4A8', '#1A1A1A'],
  },
  {
    id: 'tbm-008',
    name: 'Wall-Mounted Bathroom Vanity',
    price: 'N165,000',
    image: require('@/assets/images/product8.jpeg'),
    description:
      'A wall-mounted bathroom vanity with a ceramic basin, two soft-close drawers, and a matte white finish for clean modern bathrooms.',
    review:
      'Buyers highlight the easy installation and the generous drawer space for bathroom essentials.',
    availability: 'In stock - Limited units available',
    delivery: '15 days after payment confirmation',
    colors: ['#FFFFFF', '#E8E8E8', '#1A1A1A'],
  },
  {
    id: 'tbm-009',
    name: 'LED Mirror Cabinet',
    price: 'N125,000',
    image: require('@/assets/images/product9.jpeg'),
    description:
      'A wall-mounted LED mirror cabinet with touch dimmer, anti-fog function, and three interior shelves for bathroom storage.',
    review:
      'Customers love the anti-fog feature and the warm LED lighting that makes morning routines easier.',
    availability: 'In stock - Limited units available',
    delivery: '15 days after payment confirmation',
    colors: ['#C0C0C0', '#1A1A1A', '#C9922A'],
  },
  {
    id: 'tbm-010',
    name: 'Wall-Mounted Concealed Faucet',
    price: 'N110,000',
    image: require('@/assets/images/product10.jpeg'),
    description:
      'A wall-mounted concealed faucet with a brushed nickel finish, ceramic cartridge, and a minimalist design for luxury bathrooms.',
    review:
      'Reviewers praise the clean wall-mounted look and the smooth single-lever control for precise temperature adjustment.',
    availability: 'In stock - Limited units available',
    delivery: '15 days after payment confirmation',
    colors: ['#C0C0C0', '#E8E8E8', '#1A1A1A'],
  },
];

export const footerNavItems: HomeNavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: require('@/assets/images/home.png'),
    iconName: 'home-outline',
  },
  {
    id: 'favorite',
    label: 'Favorites',
    icon: require('@/assets/images/star.png'),
    iconName: 'heart-outline',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: require('@/assets/images/fav.png'),
    iconName: 'folder-outline',
  },
  {
    id: 'cart',
    label: 'Cart',
    icon: require('@/assets/images/Cart.png'),
    iconName: 'cart-outline',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: require('@/assets/images/Profile.png'),
    iconName: 'person-circle-outline',
  },
];

const LOCAL_PRODUCT_IMAGES = [
  require('@/assets/images/product1.jpeg'),
  require('@/assets/images/product2.jpeg'),
  require('@/assets/images/product3.jpeg'),
  require('@/assets/images/product4.jpeg'),
  require('@/assets/images/product5.jpeg'),
  require('@/assets/images/product6.jpeg'),
  require('@/assets/images/product7.jpeg'),
  require('@/assets/images/product8.jpeg'),
  require('@/assets/images/product9.jpeg'),
  require('@/assets/images/product10.jpeg'),
];

export const getLocalProductImage = (productId: string) => {
  let hash = 0;
  const str = productId || '';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % LOCAL_PRODUCT_IMAGES.length;
  return LOCAL_PRODUCT_IMAGES[index];
};

export const mapApiProduct = (item: any): HomeProduct => {
  const imageSource = item.primaryImageUrl ? { uri: item.primaryImageUrl } : { uri: '' };

  return {
    id: item.id,
    name: item.name,
    price: item.priceDisplay || (item.price != null ? `₦${Number(item.price).toLocaleString()}` : 'Request Price'),
    image: imageSource,
    description: item.description || item.shortDescription || 'No description available.',
    review: 'Highly recommended by verified buyers for build quality.',
    availability: item.inStock ? 'In stock - Limited units available' : 'Out of stock',
    delivery: '15 days after payment confirmation',
    colors: item.color ? [item.color] : ['#C9922A', '#E8E8E8', '#1A1A1A'],
  };
};
