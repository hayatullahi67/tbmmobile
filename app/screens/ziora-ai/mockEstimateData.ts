export type RenovationComplexity =
  | 'Cosmetic Refresh'
  | 'Standard Renovation'
  | 'Major Renovation'
  | 'Complete Remodel';

export type QualityTier = 'Economy' | 'Standard' | 'Luxury';

export type MaterialCategoryKey =
  | 'flooring'
  | 'cabinetry'
  | 'sanitaryWare'
  | 'lighting'
  | 'doors'
  | 'paint'
  | 'countertops';

export type MaterialSelections = Record<MaterialCategoryKey, QualityTier>;

export interface SmartEstimateInput {
  id?: string;
  projectName: string;
  roomType: string;
  lengthMeters: number;
  widthMeters: number;
  heightMeters: number;
  complexity: RenovationComplexity;
  materialSelections: MaterialSelections;
  includeFlooring: boolean;
  includePainting: boolean;
  includeElectrical: boolean;
  includePlumbing: boolean;
  contingencyPercent: number;
  infoScore?: number;
}

export interface CostLine {
  label: string;
  amount: number;
  note: string;
}

export interface SmartEstimate {
  id: string;
  projectName: string;
  roomType: string;
  complexity: RenovationComplexity;
  materialSelections: MaterialSelections;
  floorAreaSqm: number;
  wallAreaSqm: number;
  lowEstimate: number;
  highEstimate: number;
  confidence: number;
  duration: string;
  costPerSqm: number;
  costLines: CostLine[];
  paymentSchedule: CostLine[];
  recommendations: string[];
  materialSuggestions: string[];
  createdOn: string;
  disclaimer: string;
}

export const RENOVATION_COMPLEXITIES: RenovationComplexity[] = [
  'Cosmetic Refresh',
  'Standard Renovation',
  'Major Renovation',
  'Complete Remodel',
];

export const QUALITY_TIERS: QualityTier[] = ['Economy', 'Standard', 'Luxury'];

export const MATERIAL_CATEGORIES: { key: MaterialCategoryKey; label: string }[] = [
  { key: 'flooring', label: 'Flooring' },
  { key: 'cabinetry', label: 'Cabinetry' },
  { key: 'sanitaryWare', label: 'Sanitary ware' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'doors', label: 'Doors' },
  { key: 'paint', label: 'Paint' },
  { key: 'countertops', label: 'Countertops' },
];

export const DEFAULT_MATERIAL_SELECTIONS: MaterialSelections = {
  flooring: 'Standard',
  cabinetry: 'Standard',
  sanitaryWare: 'Standard',
  lighting: 'Standard',
  doors: 'Standard',
  paint: 'Standard',
  countertops: 'Standard',
};

const tierWeight: Record<QualityTier, number> = {
  Economy: 0.88,
  Standard: 1,
  Luxury: 1.34,
};

const complexityWeight: Record<RenovationComplexity, number> = {
  'Cosmetic Refresh': 0.72,
  'Standard Renovation': 1,
  'Major Renovation': 1.42,
  'Complete Remodel': 1.86,
};

const durationByComplexity: Record<RenovationComplexity, string> = {
  'Cosmetic Refresh': '5-10 working days',
  'Standard Renovation': '2-4 weeks',
  'Major Renovation': '4-8 weeks',
  'Complete Remodel': '8-14 weeks',
};

export function formatNaira(value: number) {
  return `N${Math.round(value).toLocaleString('en-US')}`;
}

export function materialSummary(selections: MaterialSelections) {
  return MATERIAL_CATEGORIES.map((category) => `${category.label}: ${selections[category.key]}`);
}

export function encodeEstimateInput(input: SmartEstimateInput) {
  return encodeURIComponent(JSON.stringify(input));
}

export function decodeEstimateInput(value?: string | string[]) {
  if (!value || Array.isArray(value)) return null;
  try {
    return JSON.parse(decodeURIComponent(value)) as SmartEstimateInput;
  } catch {
    return null;
  }
}

export function generateSmartEstimate(input: SmartEstimateInput): SmartEstimate {
  const floorAreaSqm = input.lengthMeters * input.widthMeters;
  const wallAreaSqm = 2 * (input.lengthMeters + input.widthMeters) * input.heightMeters;
  const avgTierWeight =
    Object.values(input.materialSelections).reduce((sum, tier) => sum + tierWeight[tier], 0) /
    MATERIAL_CATEGORIES.length;

  const roomBase = input.roomType === 'Kitchen' || input.roomType === 'Bathroom' ? 92000 : 68000;
  const complexity = complexityWeight[input.complexity];
  const scopeBoost =
    (input.includeFlooring ? 0.14 : 0) +
    (input.includePainting ? 0.08 : 0) +
    (input.includeElectrical ? 0.12 : 0) +
    (input.includePlumbing ? 0.16 : 0);

  const baseTotal = floorAreaSqm * roomBase * avgTierWeight * complexity * (1 + scopeBoost);
  const logistics = Math.max(45000, baseTotal * 0.075);
  const labour = baseTotal * 0.32;
  const materials = baseTotal * 0.58;
  const contingency = (materials + labour + logistics) * (input.contingencyPercent / 100);
  const midTotal = materials + labour + logistics + contingency;
  const uncertainty = 0.08 + (100 - (input.infoScore ?? 78)) / 500;
  const lowEstimate = midTotal * (1 - uncertainty);
  const highEstimate = midTotal * (1 + uncertainty);
  const confidence = Math.max(62, Math.min(96, Math.round((input.infoScore ?? 78) - uncertainty * 20)));

  const recommendations = buildRecommendations(input);

  return {
    id: input.id || `mock-${Date.now()}`,
    projectName: input.projectName,
    roomType: input.roomType,
    complexity: input.complexity,
    materialSelections: input.materialSelections,
    floorAreaSqm,
    wallAreaSqm,
    lowEstimate,
    highEstimate,
    confidence,
    duration: durationByComplexity[input.complexity],
    costPerSqm: midTotal / Math.max(floorAreaSqm, 1),
    costLines: [
      { label: 'Materials', amount: materials, note: 'Finishes and selected fixtures' },
      { label: 'Labour', amount: labour, note: 'Installation and artisan work' },
      { label: 'Logistics', amount: logistics, note: 'Delivery, handling, site movement' },
      { label: 'Contingency', amount: contingency, note: `${input.contingencyPercent}% project buffer` },
    ],
    paymentSchedule: [
      { label: 'Mobilization', amount: midTotal * 0.4, note: 'Due after approved quotation' },
      { label: 'Mid-project milestone', amount: midTotal * 0.35, note: 'Due after core installation' },
      { label: 'Completion balance', amount: midTotal * 0.25, note: 'Due before final handover' },
    ],
    recommendations,
    materialSuggestions: materialSummary(input.materialSelections),
    createdOn: new Date().toISOString(),
    disclaimer:
      'This Smart Estimate is an AI-generated budgeting guide. It is not an official TBM quotation. Final pricing is confirmed after inspection, measurement, scope verification, and material selection.',
  };
}

function buildRecommendations(input: SmartEstimateInput) {
  const tips: string[] = [];

  if (input.materialSelections.cabinetry === 'Luxury') {
    tips.push('Luxury cabinetry is a strong choice here; add soft-close hinges and hidden pull hardware.');
  } else {
    tips.push('Use standard cabinetry with upgraded handles to keep the budget controlled without looking basic.');
  }

  if (input.materialSelections.countertops === 'Luxury') {
    tips.push('Quartz or sintered stone countertops will lift durability and resale value.');
  }

  if (input.materialSelections.lighting !== 'Economy') {
    tips.push('Add layered lighting: task lights, ambient ceiling lighting, and accent strips.');
  }

  if (input.complexity === 'Major Renovation' || input.complexity === 'Complete Remodel') {
    tips.push('Book a site inspection before committing budget because hidden structural work may affect cost.');
  }

  if (input.includeElectrical) {
    tips.push('Plan sockets and switches before finishing works to avoid rework after installation.');
  }

  return tips;
}

export const MOCK_SAVED_ESTIMATES: SmartEstimate[] = [
  generateSmartEstimate({
    id: 'saved-kitchen-standard',
    projectName: 'Lekki Kitchen Refresh',
    roomType: 'Kitchen',
    lengthMeters: 4.8,
    widthMeters: 3.6,
    heightMeters: 2.9,
    complexity: 'Standard Renovation',
    materialSelections: {
      ...DEFAULT_MATERIAL_SELECTIONS,
      cabinetry: 'Luxury',
      countertops: 'Luxury',
      paint: 'Standard',
    },
    includeFlooring: true,
    includePainting: true,
    includeElectrical: true,
    includePlumbing: true,
    contingencyPercent: 10,
    infoScore: 88,
  }),
  generateSmartEstimate({
    id: 'saved-living-economy',
    projectName: 'Apartment Living Room',
    roomType: 'Living Room',
    lengthMeters: 5.2,
    widthMeters: 4.1,
    heightMeters: 2.8,
    complexity: 'Cosmetic Refresh',
    materialSelections: {
      ...DEFAULT_MATERIAL_SELECTIONS,
      flooring: 'Economy',
      paint: 'Economy',
      lighting: 'Standard',
    },
    includeFlooring: true,
    includePainting: true,
    includeElectrical: false,
    includePlumbing: false,
    contingencyPercent: 8,
    infoScore: 82,
  }),
];

export function getMockEstimateById(id?: string) {
  return MOCK_SAVED_ESTIMATES.find((estimate) => estimate.id === id) || null;
}
