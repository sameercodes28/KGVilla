import { CostItem, Project, Room } from '../types';

export const projectDetails: Project = {
    id: 'p-jb-1405',
    name: 'Villa JB-1405',
    clientName: 'JB Villan',
    address: 'Hustypsvägen 1, 123 45 Husby',
    location: 'Husby, Sweden',
    description: 'Modern 1.5-story villa with open floor plan.',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-05-22'),
    bbrStandard: 'BBR 29',
    levels: [
        { id: 'l-01', projectId: 'p-jb-1405', name: 'Plan 1', elevation: 0 },
        { id: 'l-02', projectId: 'p-jb-1405', name: 'Plan 2', elevation: 2700 }
    ],
    totalArea: 140.5,
    currency: 'SEK',
    status: 'draft',
    lastModified: '2024-05-22',
    version: '1.0.0'
};

export const mockProject = {
    ...projectDetails,
    location: 'Husby, Sweden'
};

export const clientCosts = [
    { id: 'cc-01', name: 'Lagfart', description: 'Stämpelskatt (1.5% av köpeskilling) + exp.avgift', cost: 45000 },
    { id: 'cc-02', name: 'Pantbrev', description: 'Stämpelskatt (2% av pantbrev) + exp.avgift', cost: 65000 },
    { id: 'cc-03', name: 'Bygglov & Planavgift', description: 'Kommunal avgift för bygglovshantering', cost: 35000 },
    { id: 'cc-04', name: 'Nybyggnadskarta', description: 'Underlag för situationsplan', cost: 8000 },
    { id: 'cc-05', name: 'Utstakning', description: 'Grov- och finutstakning', cost: 12000 },
    { id: 'cc-06', name: 'Kontrollansvarig (KA)', description: 'Certifierad kontrollansvarig enl. PBL', cost: 25000 },
    { id: 'cc-07', name: 'Elanslutning', description: 'Anslutningsavgift till nätägare (16-25A)', cost: 35000 },
    { id: 'cc-08', name: 'Fiberanslutning', description: 'Installation av fiber', cost: 20000 },
    { id: 'cc-09', name: 'Byggström', description: 'Hyra av byggskåp + förbrukning', cost: 15000 },
    { id: 'cc-10', name: 'Byggförsäkring', description: 'Under byggtiden', cost: 8000 }
];

export const rooms: Room[] = [
    { id: 'r-01', name: 'Kök & Matplats', type: 'kitchen', area: 32.5, levelId: 'l-01' },
    { id: 'r-02', name: 'Vardagsrum', type: 'living', area: 28.0, levelId: 'l-01' },
    { id: 'r-03', name: 'Sovrum 1 (Master)', type: 'bedroom', area: 14.5, levelId: 'l-01' },
    { id: 'r-04', name: 'Sovrum 2', type: 'bedroom', area: 11.0, levelId: 'l-01' },
    { id: 'r-05', name: 'Sovrum 3', type: 'bedroom', area: 11.0, levelId: 'l-01' },
    { id: 'r-06', name: 'Badrum 1', type: 'bathroom', area: 6.5, levelId: 'l-01' },
    { id: 'r-07', name: 'Badrum 2 / Tvätt', type: 'utility', area: 8.0, levelId: 'l-01' },
    { id: 'r-08', name: 'Hall / Entré', type: 'hall', area: 8.5, levelId: 'l-01' },
    { id: 'r-09', name: 'Teknikrum', type: 'utility', area: 4.0, levelId: 'l-01' }
];

export const initialCostItems: CostItem[] = [
    // ----------------------------------------------------------------------
    // 1. MARKARBETEN (Groundwork)
    // ----------------------------------------------------------------------
    {
        id: 'item-mark-01',
        projectId: 'p-jb-1405',
        phase: 'ground',
        elementName: 'Etablering & Schaktning',
        description: 'Etablering, grovschaktning för platta på mark, bortforsling av massor.',
        quantity: 1,
        unit: 'st',
        unitPrice: 125000,
        totalQuantity: 1,
        totalCost: 125000,
        confidenceScore: 0.90,
        calculationLogic: 'Schablon för normaltomt (plan, ej berg).',
        guidelineReference: 'Wikells Sektionsfakta 2024',
        system: 'structure'
    },
    {
        id: 'item-mark-02',
        projectId: 'p-jb-1405',
        phase: 'ground',
        elementName: 'Grundläggning (Platta på mark)',
        description: 'Isolerad betongplatta inkl. armering, kantelement och gjutning.',
        quantity: 140.5,
        unit: 'm2',
        unitPrice: 3200,
        totalQuantity: 140.5,
        totalCost: 449600,
        confidenceScore: 0.95,
        calculationLogic: 'Baserat på 140.5 m2 byggyta. Inkluderar 300mm cellplast.',
        guidelineReference: 'Markentreprenad Index 2024',
        system: 'structure',
        validationData: { type: 'area', coordinates: [[10, 10], [90, 10], [90, 90], [10, 90]] }
    },
    {
        id: 'item-mark-03',
        projectId: 'p-jb-1405',
        phase: 'ground',
        elementName: 'VA & Dränering (Utvändigt)',
        description: 'Anslutning till kommunalt VA, dagvattenkassetter och dränering runt grund.',
        quantity: 1,
        unit: 'st',
        unitPrice: 85000,
        totalQuantity: 1,
        totalCost: 85000,
        confidenceScore: 0.85,
        system: 'vvs'
    },

    // ----------------------------------------------------------------------
    // 2. STOMME & YTTERVÄGGAR (Structure)
    // ----------------------------------------------------------------------
    {
        id: 'item-stom-01',
        projectId: 'p-jb-1405',
        phase: 'structure',
        elementName: 'Ytterväggar (Prefab)',
        description: 'Färdiga väggblock, trästomme 195mm, isolering, vindduk.',
        quantity: 155,
        unit: 'm2',
        unitPrice: 2800,
        totalQuantity: 155,
        totalCost: 434000,
        confidenceScore: 0.92,
        calculationLogic: 'Fasadomkrets x höjd (2.7m) minus öppningar.',
        guidelineReference: 'JB Villan Standard',
        system: 'structure',
        validationData: { type: 'line', coordinates: [[10, 10], [90, 10], [90, 90], [10, 90], [10, 10]] }
    },
    {
        id: 'item-stom-02',
        projectId: 'p-jb-1405',
        phase: 'structure',
        elementName: 'Takstolar & Yttertak',
        description: 'Takstolar, råspont, papp, läkt och betongpannor (Benders).',
        quantity: 180,
        unit: 'm2',
        unitPrice: 1950,
        totalQuantity: 180,
        totalCost: 351000,
        confidenceScore: 0.90,
        calculationLogic: 'Takyta inkl. överhäng.',
        system: 'structure'
    },
    {
        id: 'item-stom-03',
        projectId: 'p-jb-1405',
        phase: 'structure',
        elementName: 'Fönster & Ytterdörrar',
        description: 'Elitfönster 3-glas isoler, Entrédörr Diplomat.',
        quantity: 14,
        unit: 'st',
        unitPrice: 8500,
        totalQuantity: 14,
        totalCost: 119000,
        confidenceScore: 0.95,
        calculationLogic: 'Enligt fasadritning: 10 fönster, 2 altandörrar, 1 entré, 1 groventré.',
        system: 'structure'
    },

    // ----------------------------------------------------------------------
    // 3. ELINSTALLATIONER (Electrical)
    // ----------------------------------------------------------------------
    // Kök
    {
        id: 'item-el-k-01',
        projectId: 'p-jb-1405',
        phase: 'installations',
        elementName: 'Eluttag (Kök)',
        description: 'Vägguttag 2-vägs jordat (Schneider Exxact).',
        quantity: 8,
        unit: 'st',
        unitPrice: 950,
        totalQuantity: 8,
        totalCost: 7600,
        confidenceScore: 0.98,
        roomId: 'r-01',
        system: 'el',
        validationData: { type: 'point', coordinates: [[20, 20], [25, 20], [30, 20], [20, 25]] }
    },
    {
        id: 'item-el-k-02',
        projectId: 'p-jb-1405',
        phase: 'installations',
        elementName: 'Belysning Spotlights (Kök)',
        description: 'Infällda LED-spotlights inkl. drivdon.',
        quantity: 12,
        unit: 'st',
        unitPrice: 1400,
        totalQuantity: 12,
        totalCost: 16800,
        confidenceScore: 0.95,
        roomId: 'r-01',
        system: 'el',
        validationData: { type: 'point', coordinates: [[22, 22], [24, 22], [26, 22], [28, 22]] }
    },
    // Vardagsrum
    {
        id: 'item-el-v-01',
        projectId: 'p-jb-1405',
        phase: 'installations',
        elementName: 'Eluttag (Vardagsrum)',
        description: 'Vägguttag 2-vägs jordat.',
        quantity: 6,
        unit: 'st',
        unitPrice: 950,
        totalQuantity: 6,
        totalCost: 5700,
        confidenceScore: 0.98,
        roomId: 'r-02',
        system: 'el',
        validationData: { type: 'point', coordinates: [[50, 50], [60, 50], [70, 50]] }
    },
    // Sovrum (Generellt)
    {
        id: 'item-el-s-01',
        projectId: 'p-jb-1405',
        phase: 'installations',
        elementName: 'Eluttag (Sovrum)',
        description: 'Vägguttag 2-vägs jordat (4 per rum).',
        quantity: 12,
        unit: 'st',
        unitPrice: 950,
        totalQuantity: 12,
        totalCost: 11400,
        confidenceScore: 0.95,
        roomId: 'r-03', // Kopplat till Master för visualisering, men täcker alla
        system: 'el'
    },
    // Central & Matning
    {
        id: 'item-el-01',
        projectId: 'p-jb-1405',
        phase: 'installations',
        elementName: 'Elcentral & Mätarskåp',
        description: 'Fasadmätarskåp + Mediacentral + Normcentral med JFB.',
        quantity: 1,
        unit: 'st',
        unitPrice: 25000,
        totalQuantity: 1,
        totalCost: 25000,
        confidenceScore: 0.99,
        roomId: 'r-09',
        system: 'el'
    },

    // ----------------------------------------------------------------------
    // 4. VVS (Plumbing)
    // ----------------------------------------------------------------------
    {
        id: 'item-vvs-01',
        projectId: 'p-jb-1405',
        phase: 'installations',
        elementName: 'Vattenburen Golvvärme',
        description: 'Komplett system inkl. fördelare, rör och termostater (Thermotech).',
        quantity: 140.5,
        unit: 'm2',
        unitPrice: 650,
        totalQuantity: 140.5,
        totalCost: 91325,
        confidenceScore: 0.95,
        system: 'vvs'
    },
    {
        id: 'item-vvs-02',
        projectId: 'p-jb-1405',
        phase: 'installations',
        elementName: 'Värmepump (Frånluft)',
        description: 'NIBE F730 Frånluftsvärmepump inkl. installation.',
        quantity: 1,
        unit: 'st',
        unitPrice: 115000,
        totalQuantity: 1,
        totalCost: 115000,
        confidenceScore: 0.98,
        roomId: 'r-09',
        system: 'vvs'
    },
    // Badrum 1
    {
        id: 'item-vvs-b1-01',
        projectId: 'p-jb-1405',
        phase: 'installations',
        elementName: 'WC-stol (Badrum 1)',
        description: 'Gustavsberg Nautic vägghängd inkl. fixtur.',
        quantity: 1,
        unit: 'st',
        unitPrice: 8500,
        totalQuantity: 1,
        totalCost: 8500,
        confidenceScore: 0.95,
        roomId: 'r-06',
        system: 'vvs',
        validationData: { type: 'point', coordinates: [[65, 35]] }
    },
    {
        id: 'item-vvs-b1-02',
        projectId: 'p-jb-1405',
        phase: 'installations',
        elementName: 'Tvättställsblandare (Badrum 1)',
        description: 'Mora MMIX.',
        quantity: 1,
        unit: 'st',
        unitPrice: 2500,
        totalQuantity: 1,
        totalCost: 2500,
        confidenceScore: 0.95,
        roomId: 'r-06',
        system: 'vvs'
    },
    {
        id: 'item-vvs-b1-03',
        projectId: 'p-jb-1405',
        phase: 'installations',
        elementName: 'Duschväggar & Blandare',
        description: 'INR Linc + Mora MMIX takdusch.',
        quantity: 1,
        unit: 'st',
        unitPrice: 14000,
        totalQuantity: 1,
        totalCost: 14000,
        confidenceScore: 0.90,
        roomId: 'r-06',
        system: 'vvs'
    },

    // ----------------------------------------------------------------------
    // 5. INTERIÖR & YTSKIKT (Interior)
    // ----------------------------------------------------------------------
    {
        id: 'item-int-01',
        projectId: 'p-jb-1405',
        phase: 'interior',
        elementName: 'Parkettgolv (Kährs)',
        description: 'Kährs Ek 3-stav, 15mm.',
        quantity: 120,
        unit: 'm2',
        unitPrice: 650,
        totalQuantity: 120,
        totalCost: 78000,
        confidenceScore: 0.90,
        calculationLogic: 'Totalyta minus våtrum.',
        system: 'interior'
    },
    {
        id: 'item-int-02',
        projectId: 'p-jb-1405',
        phase: 'interior',
        elementName: 'Klinker & Kakel (Badrum/Hall)',
        description: 'Arbetskostnad + material (snittpris).',
        quantity: 45,
        unit: 'm2',
        unitPrice: 1800,
        totalQuantity: 45,
        totalCost: 81000,
        confidenceScore: 0.85,
        roomId: 'r-06', // Representativt
        system: 'interior'
    },
    {
        id: 'item-int-03',
        projectId: 'p-jb-1405',
        phase: 'interior',
        elementName: 'Innerdörrar',
        description: 'Swedoor slät vit inkl. karm och trycke.',
        quantity: 9,
        unit: 'st',
        unitPrice: 3500,
        totalQuantity: 9,
        totalCost: 31500,
        confidenceScore: 0.95,
        system: 'interior'
    },
    {
        id: 'item-int-04',
        projectId: 'p-jb-1405',
        phase: 'interior',
        elementName: 'Köksinredning',
        description: 'Ballingslöv eller Marbodal standardkök inkl. montering.',
        quantity: 1,
        unit: 'st',
        unitPrice: 185000,
        totalQuantity: 1,
        totalCost: 185000,
        confidenceScore: 0.88,
        roomId: 'r-01',
        system: 'interior'
    },
    {
        id: 'item-int-05',
        projectId: 'p-jb-1405',
        phase: 'interior',
        elementName: 'Vitvaror',
        description: 'Siemens paket (Kyl, Frys, Ugn, Häll, DM).',
        quantity: 1,
        unit: 'st',
        unitPrice: 65000,
        totalQuantity: 1,
        totalCost: 65000,
        confidenceScore: 0.95,
        roomId: 'r-01',
        system: 'interior'
    }
];
