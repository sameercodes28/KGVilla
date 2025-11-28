export type Unit = 'm' | 'm2' | 'm3' | 'kg' | 'st' | 'lpm' | 'parti' | 'pkt';

export interface Level {
  id: string;
  projectId: string;
  name: string; // e.g., "Plan 1", "Plan 2", "Källare"
  elevation: number; // relative to ground
}

export interface Project {
  id: string;
  name: string;
  location: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  bbrStandard: string; // e.g., "BBR 29"
  levels: Level[];
  // Extended properties for UI
  clientName?: string;
  address?: string;
  totalArea?: number;
  boa?: number;           // Living area (BOA) - Swedish standard
  biarea?: number;        // Secondary area (Biarea) - garage, storage
  estimatedCost?: number; // Total estimated cost from analysis
  currency?: string;
  status?: string;
  lastModified?: string;
  version?: string;
  floorPlanUrl?: string;
}

export interface Drawing {
  id: string;
  projectId: string;
  levelId?: string; // Linked to a specific level
  name: string;
  type: 'plan' | 'section' | 'elevation' | 'detail';
  url: string; // Path to the file (or blob URL in browser)
  scale: number; // e.g., 100 for 1:100
}

export interface Assembly {
  id: string;
  name: string;
  description: string;
  category: 'wall' | 'floor' | 'roof' | 'foundation' | 'window' | 'door';
  uValue?: number;
  layers: {
    material: string;
    thickness: number; // mm
  }[];
}

export type ConstructionPhase = 'ground' | 'structure' | 'electrical' | 'plumbing' | 'interior' | 'completion';

export interface CostBreakdown {
  material: number;
  labor: number;
  formula: string;
  components: string[];
  source: string;
}

export interface QuantityBreakdownItem {
  name: string;        // e.g., "WC/D1", "TVÄTT"
  value: number;       // e.g., 3.1, 7.8
  unit: string;        // e.g., "m²"
  category?: string;   // e.g., "bathroom", "laundry"
}

export interface QuantityBreakdown {
  items: QuantityBreakdownItem[];
  total: number;
  unit: string;
  calculationMethod?: string;  // e.g., "Sum of wet room floor areas"
}

/**
 * JB Villan Efficiency Types:
 * - PREFAB: Item manufactured off-site in JB Villan's factory
 * - STREAMLINED: Benefits from faster build time (downstream effect of prefab)
 * - STANDARDIZED: Benefits from proven, standardized designs (lower risk)
 */
export type EfficiencyType = 'PREFAB' | 'STREAMLINED' | 'STANDARDIZED';

export interface PrefabDiscount {
  efficiencyType?: EfficiencyType;  // Type of efficiency (defaults to PREFAB for backwards compat)
  generalContractorPrice: number;   // What a general contractor would charge
  jbVillanPrice: number;            // JB Villan's price
  savingsAmount: number;            // generalContractorPrice - jbVillanPrice
  savingsPercent: number;           // Percentage saved
  reason: string;                   // Short reason for savings
  explanation?: string;             // Detailed explanation of why this efficiency applies
}

export interface CostItem {
  id: string;
  projectId: string;
  levelId?: string; // Linked to a specific level
  phase: ConstructionPhase; // New field for process grouping
  elementName: string; // e.g., "Yttervägg Typ A"
  description: string;
  quantity: number;
  unit: Unit;
  unitPrice: number; // SEK
  totalCost: number; // SEK
  wastePercentage?: number;
  totalQuantity: number; // quantity * (1 + wastePercentage/100)
  confidenceScore: number; // 0.0 to 1.0
  sourceDrawingId?: string;
  assemblyId?: string;
  calculationLogic?: string; // Explanation of how the quantity was derived
  guidelineReference?: string; // Reference to BBR, AMA, or standard practice
  
  // Detailed Breakdown (Explainability)
  breakdown?: CostBreakdown;

  // Quantity Breakdown (shows which rooms/components contribute to total)
  quantityBreakdown?: QuantityBreakdown;

  options?: {
    id: string;
    name: string;
    description?: string;
    priceModifier: number;
  }[];
  selectedOptionId?: string;
  validationData?: {
    type: 'area' | 'line' | 'point';
    count?: number;
    coordinates: number[][];
  };
  roomId?: string;
  system?: 'structure' | 'el' | 'vvs' | 'interior';
  // User Customization
  customUnitPrice?: number;
  customQuantity?: number;
  isUserAdded?: boolean;
  userNotes?: string;
  disabled?: boolean; // When true, item is excluded from total cost calculation

  // JB Villan Prefab Efficiency
  prefabDiscount?: PrefabDiscount; // If present, item has prefab efficiency savings
}

export interface Room {
  id: string;
  name: string;
  type: 'kitchen' | 'bathroom' | 'bedroom' | 'living' | 'hall' | 'utility';
  area: number;
  levelId: string;
}
