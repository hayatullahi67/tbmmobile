export interface VisualizerData {
  mainTitle: string;
  subTitle: string;
  tabs: string[];
  accuracy: string;
  accuracyLabel: string;
  materialBlend: string;
  materialPercentage: number;
}

export function getVisualizerData(promptText: string): VisualizerData {
  const query = promptText.toLowerCase().trim();

  // Helper to capitalize words
  const capitalize = (str: string) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  // 1. Kitchen
  if (query.includes('kitchen') || query.includes('cooking') || query.includes('dining')) {
    return {
      mainTitle: 'Minimalist Culinary Space',
      subTitle: 'Smart Kitchen Simulation v3.1',
      tabs: ['Compact', 'Gourmet'],
      accuracy: '99.2%',
      accuracyLabel: 'Production Ready',
      materialBlend: 'Quartz vs Oak Wood',
      materialPercentage: 78,
    };
  }

  // 2. Bedroom
  if (query.includes('bedroom') || query.includes('bed') || query.includes('sleep')) {
    return {
      mainTitle: 'Scandinavian Sanctuary',
      subTitle: 'Cozy Bedroom Simulation v1.8',
      tabs: ['Minimalist', 'Boho Luxe'],
      accuracy: '97.6%',
      accuracyLabel: 'Atmospheric Match',
      materialBlend: 'Linen vs Walnut',
      materialPercentage: 65,
    };
  }

  // 3. Office / Work
  if (query.includes('office') || query.includes('study') || query.includes('work') || query.includes('desk')) {
    return {
      mainTitle: 'Industrial Executive Suite',
      subTitle: 'Productive Workspace Simulation v2.2',
      tabs: ['Ergonomic', 'Executive'],
      accuracy: '98.9%',
      accuracyLabel: 'Precision Render',
      materialBlend: 'Steel vs Leather',
      materialPercentage: 90,
    };
  }

  // 4. Bathroom
  if (query.includes('bathroom') || query.includes('bath') || query.includes('shower') || query.includes('toilet')) {
    return {
      mainTitle: 'Spa-Inspired Oasis',
      subTitle: 'Modern Bathroom Simulation v2.5',
      tabs: ['Standard', 'Luxury Spa'],
      accuracy: '98.1%',
      accuracyLabel: 'High Fidelity',
      materialBlend: 'Terrazzo vs Marble',
      materialPercentage: 82,
    };
  }

  // 5. Garden / Outdoor
  if (query.includes('garden') || query.includes('outdoor') || query.includes('patio') || query.includes('backyard')) {
    return {
      mainTitle: 'Lush Outdoor Oasis',
      subTitle: 'Biophilic Patio Simulation v1.5',
      tabs: ['Flora Green', 'Hardscape Lounge'],
      accuracy: '96.8%',
      accuracyLabel: 'Organic Fidelity',
      materialBlend: 'Teak vs Slate Stone',
      materialPercentage: 70,
    };
  }

  // 6. Generic or Custom Prompt Dynamic Generation
  if (query.length > 0) {
    // Format the prompt text nicely into a title
    const formattedTitle = capitalize(promptText);
    const cleanTitle = formattedTitle.endsWith('.') ? formattedTitle.slice(0, -1) : formattedTitle;

    // Deterministic random selection based on prompt string to make it look stable but dynamic
    const hash = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const accuracyVal = (95.0 + (hash % 45) / 10).toFixed(1); // 95.0% - 99.4%
    const blendPercent = 50 + (hash % 41); // 50% - 90%
    
    const blends = [
      'Concrete vs Glass',
      'Chrome vs Timber',
      'Marble vs Brass',
      'Velvet vs Carbon Fiber',
      'Clay vs Bamboo',
    ];
    const chosenBlend = blends[hash % blends.length];

    return {
      mainTitle: `${cleanTitle} Concept`,
      subTitle: `Dynamic AI Simulation v${(1.0 + (hash % 9) / 2).toFixed(1)}`,
      tabs: ['Standard', 'Premium Upgrade'],
      accuracy: `${accuracyVal}%`,
      accuracyLabel: 'Dynamic AI Render',
      materialBlend: chosenBlend,
      materialPercentage: blendPercent,
    };
  }

  // 7. Default (Modern Luxury Living)
  return {
    mainTitle: 'Modern Luxury Living',
    subTitle: 'Renovation Simulation v2.4',
    tabs: ['Economy', 'Luxury'],
    accuracy: '98.4%',
    accuracyLabel: 'High Fidelity',
    materialBlend: 'Luxury vs Economy',
    materialPercentage: 85,
  };
}

export interface MaterialItem {
  id: string;
  name: string;
  price: string;
  unit: string;
  description: string;
  image: string | number;
  tag: 'Luxury' | 'Economy';
  badges: string[];
  quantity: string;
  category: 'Flooring' | 'Walls' | 'Roofing' | 'Windows';
}

export function getMaterialsForPrompt(promptText: string): MaterialItem[] {
  const query = promptText.toLowerCase().trim();

  // Helper to dynamically size/hash fallback arrays so we always get consistent, valid mock data
  const kitchenMaterials: MaterialItem[] = [
    {
      id: 'k1',
      name: 'Artisan European Oak',
      price: '$14.50',
      unit: '/sq ft',
      description: 'Wide-plank, wire-brushed texture with a matte oil finish for high-end residential interiors.',
      image: require('@/assets/images/european_oak.png'),
      tag: 'Luxury',
      badges: ['In Stock', 'In Stock', '4-6 Weeks'],
      quantity: '1,200 sq ft',
      category: 'Flooring',
    },
    {
      id: 'k2',
      name: 'Nordic Ash Laminate',
      price: '$4.25',
      unit: '/sq ft',
      description: 'Durable AC4 rated surface with waterproof core technology, ideal for high-traffic rental spaces.',
      image: require('@/assets/images/ash_laminate.png'),
      tag: 'Economy',
      badges: ['In Stock', '1-2 Weeks'],
      quantity: '850 sq ft',
      category: 'Flooring',
    },
    {
      id: 'k3',
      name: 'Calacatta Gold Quartz',
      price: '$32.00',
      unit: '/sq ft',
      description: 'Stunning white quartz with prominent grey and gold veining, perfect for elegant countertops.',
      image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=500&auto=format&fit=crop&q=60',
      tag: 'Luxury',
      badges: ['In Stock', '2-3 Weeks'],
      quantity: '240 sq ft',
      category: 'Walls',
    },
    {
      id: 'k4',
      name: 'Matte Charcoal Backsplash',
      price: '$6.50',
      unit: '/sq ft',
      description: 'Minimalist glazed ceramic tiles with a velvety matte black finish, highly grease-resistant.',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=60',
      tag: 'Economy',
      badges: ['In Stock', '3-5 Days'],
      quantity: '180 sq ft',
      category: 'Walls',
    },
    {
      id: 'k5',
      name: 'Argon Smart-Glass Windows',
      price: '$240.00',
      unit: '/unit',
      description: 'Double-glazed thermal energy efficient smart windows with integrated UV control filters.',
      image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&auto=format&fit=crop&q=60',
      tag: 'Luxury',
      badges: ['Custom', '6-8 Weeks'],
      quantity: '6 units',
      category: 'Windows',
    },
    {
      id: 'k6',
      name: 'Terracotta Slated Shingles',
      price: '$18.50',
      unit: '/sq ft',
      description: 'Natural clay-slated roofing material providing high thermal isolation and Spanish style.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=60',
      tag: 'Luxury',
      badges: ['In Stock', '3 Weeks'],
      quantity: '2,800 sq ft',
      category: 'Roofing',
    },
  ];

  const bedroomMaterials: MaterialItem[] = [
    {
      id: 'b1',
      name: 'Ribbed Walnut Panels',
      price: '$19.20',
      unit: '/sq ft',
      description: 'Luxurious sound-absorbing 3D walnut wooden slats for high-end headboard accent backdrops.',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&auto=format&fit=crop&q=60',
      tag: 'Luxury',
      badges: ['In Stock', '4-5 Weeks'],
      quantity: '320 sq ft',
      category: 'Walls',
    },
    {
      id: 'b2',
      name: 'Organic Linen Wallcovering',
      price: '$5.80',
      unit: '/sq ft',
      description: 'Breathable, eco-friendly woven linen wallpapers that offer dynamic tactile sanctuary textures.',
      image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=500&auto=format&fit=crop&q=60',
      tag: 'Economy',
      badges: ['In Stock', '1-2 Weeks'],
      quantity: '450 sq ft',
      category: 'Walls',
    },
    {
      id: 'b3',
      name: 'Velvet Plush Carpeting',
      price: '$8.50',
      unit: '/sq ft',
      description: 'Thick, ultra-soft luxury bedroom carpeting made of stain-resistant tufted fibers.',
      image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&auto=format&fit=crop&q=60',
      tag: 'Luxury',
      badges: ['In Stock', '2 Weeks'],
      quantity: '600 sq ft',
      category: 'Flooring',
    },
    {
      id: 'b4',
      name: 'Cozy Oak Laminate',
      price: '$3.95',
      unit: '/sq ft',
      description: 'Warm oak textured scratch-resistant flooring. Quick click-lock DIY installation system.',
      image: require('@/assets/images/ash_laminate.png'),
      tag: 'Economy',
      badges: ['In Stock', '3-5 Days'],
      quantity: '750 sq ft',
      category: 'Flooring',
    },
    {
      id: 'b5',
      name: 'Blackout Casement Windows',
      price: '$175.00',
      unit: '/unit',
      description: 'Dual-pane acoustic thermal windows optimized with internal electromagnetic privacy shades.',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=60',
      tag: 'Luxury',
      badges: ['In Stock', '4 Weeks'],
      quantity: '4 units',
      category: 'Windows',
    },
  ];

  const bathroomMaterials: MaterialItem[] = [
    {
      id: 'ba1',
      name: 'Carrara Marble Wall Slabs',
      price: '$35.00',
      unit: '/sq ft',
      description: 'Premium Italian marble plates with polished finish. Ideal for water-tight wet spa walls.',
      image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&auto=format&fit=crop&q=60',
      tag: 'Luxury',
      badges: ['Special Order', '6 Weeks'],
      quantity: '280 sq ft',
      category: 'Walls',
    },
    {
      id: 'ba2',
      name: 'Terrazzo Mosaic Floor Tiles',
      price: '$18.25',
      unit: '/sq ft',
      description: 'Vibrant, non-slip luxury quartz-blend terrazzo floor tiling for high-moisture spa environments.',
      image: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=500&auto=format&fit=crop&q=60',
      tag: 'Luxury',
      badges: ['In Stock', '2-3 Weeks'],
      quantity: '180 sq ft',
      category: 'Flooring',
    },
    {
      id: 'ba3',
      name: 'Nordic Slate Porcelain',
      price: '$5.40',
      unit: '/sq ft',
      description: 'Textured charcoal-grey porcelain floor planks offering a rustic modern thermal stone feel.',
      image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=500&auto=format&fit=crop&q=60',
      tag: 'Economy',
      badges: ['In Stock', '3-5 Days'],
      quantity: '220 sq ft',
      category: 'Flooring',
    },
    {
      id: 'ba4',
      name: 'Frosted Smart Privacy Pane',
      price: '$195.00',
      unit: '/unit',
      description: 'Frosted low-E privacy window with electronic control. Turns completely clear on command.',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=60',
      tag: 'Luxury',
      badges: ['Custom', '4-5 Weeks'],
      quantity: '2 units',
      category: 'Windows',
    },
  ];

  const officeMaterials: MaterialItem[] = [
    {
      id: 'o1',
      name: 'Industrial Polished Concrete',
      price: '$11.80',
      unit: '/sq ft',
      description: 'Glossy polished architectural concrete topping. Highly reflective and extremely hard-wearing.',
      image: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=500&auto=format&fit=crop&q=60',
      tag: 'Luxury',
      badges: ['On Site Mix', '1 Week'],
      quantity: '900 sq ft',
      category: 'Flooring',
    },
    {
      id: 'o2',
      name: 'Acoustic Charcoal Felt Planks',
      price: '$13.20',
      unit: '/sq ft',
      description: 'Recycled PET acoustic paneling that reduces echo and ambient sound levels in busy executive suites.',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=60',
      tag: 'Luxury',
      badges: ['In Stock', '2 Weeks'],
      quantity: '400 sq ft',
      category: 'Walls',
    },
    {
      id: 'o3',
      name: 'Standing Seam Zinc Roofing',
      price: '$24.50',
      unit: '/sq ft',
      description: 'Architectural grade matte zinc panels providing maximum lifetimes and an ultra-modern aesthetic.',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60',
      tag: 'Luxury',
      badges: ['In Stock', '4 Weeks'],
      quantity: '1,500 sq ft',
      category: 'Roofing',
    },
  ];

  const gardenMaterials: MaterialItem[] = [
    {
      id: 'g1',
      name: 'Premium Teak Decking',
      price: '$22.40',
      unit: '/sq ft',
      description: 'Sustainably sourced premium teak wooden decking planks. Highly resistant to rot and termites.',
      image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=500&auto=format&fit=crop&q=60',
      tag: 'Luxury',
      badges: ['In Stock', '4-6 Weeks'],
      quantity: '640 sq ft',
      category: 'Flooring',
    },
    {
      id: 'g2',
      name: 'Biophilic Slate Stone Pavers',
      price: '$12.50',
      unit: '/sq ft',
      description: 'Natural hand-cut dark slate stone flooring flags for dynamic, biophilic garden walkways.',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=60',
      tag: 'Luxury',
      badges: ['In Stock', '2 Weeks'],
      quantity: '980 sq ft',
      category: 'Flooring',
    },
    {
      id: 'g3',
      name: 'Weathered Pine Fencing Planks',
      price: '$4.10',
      unit: '/sq ft',
      description: 'Pressure-treated structural wood cladding offering deep grain patterns and high element shielding.',
      image: require('@/assets/images/ash_laminate.png'),
      tag: 'Economy',
      badges: ['In Stock', '3-5 Days'],
      quantity: '1,200 sq ft',
      category: 'Walls',
    },
  ];

  // Match logic corresponding to getVisualizerData
  if (query.includes('kitchen') || query.includes('cooking') || query.includes('dining')) {
    return kitchenMaterials;
  }
  if (query.includes('bedroom') || query.includes('bed') || query.includes('sleep')) {
    return bedroomMaterials;
  }
  if (query.includes('bathroom') || query.includes('bath') || query.includes('shower') || query.includes('toilet')) {
    return bathroomMaterials;
  }
  if (query.includes('office') || query.includes('study') || query.includes('work') || query.includes('desk')) {
    return officeMaterials;
  }
  if (query.includes('garden') || query.includes('outdoor') || query.includes('patio') || query.includes('backyard')) {
    return gardenMaterials;
  }

  // Default rich mixed set
  return [
    {
      id: 'd1',
      name: 'Artisan European Oak',
      price: '$14.50',
      unit: '/sq ft',
      description: 'Wide-plank, wire-brushed texture with a matte oil finish for high-end residential interiors.',
      image: require('@/assets/images/european_oak.png'),
      tag: 'Luxury',
      badges: ['In Stock', 'In Stock', '4-6 Weeks'],
      quantity: '1,200 sq ft',
      category: 'Flooring',
    },
    {
      id: 'd2',
      name: 'Nordic Ash Laminate',
      price: '$4.25',
      unit: '/sq ft',
      description: 'Durable AC4 rated surface with waterproof core technology, ideal for high-traffic rental spaces.',
      image: require('@/assets/images/ash_laminate.png'),
      tag: 'Economy',
      badges: ['In Stock', '1-2 Weeks'],
      quantity: '850 sq ft',
      category: 'Flooring',
    },
    {
      id: 'd3',
      name: 'Ribbed Walnut Panels',
      price: '$19.20',
      unit: '/sq ft',
      description: 'Luxurious sound-absorbing 3D walnut wooden slats for high-end headboard accent backdrops.',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&auto=format&fit=crop&q=60',
      tag: 'Luxury',
      badges: ['In Stock', '4-5 Weeks'],
      quantity: '320 sq ft',
      category: 'Walls',
    },
    {
      id: 'd4',
      name: 'Calacatta Gold Quartz',
      price: '$32.00',
      unit: '/sq ft',
      description: 'Stunning white quartz with prominent grey and gold veining, perfect for elegant countertops.',
      image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=500&auto=format&fit=crop&q=60',
      tag: 'Luxury',
      badges: ['In Stock', '2-3 Weeks'],
      quantity: '240 sq ft',
      category: 'Walls',
    },
  ];
}

