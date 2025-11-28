'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Scale, Ruler, Hammer, Zap, FileText, Building2, Droplets, Wind, Volume2, Leaf, AlertTriangle, BadgeCheck, Accessibility, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

type RegulationCategory = 'building' | 'water' | 'electrical' | 'energy' | 'quality';

interface Regulation {
    id: string;
    name: string;
    fullName: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
    importance: string;
    whatWeUse: string[];
    link?: string;
    category: RegulationCategory;
}

const CATEGORIES = [
    { id: 'all', name: 'All', nameSv: 'Alla', icon: Check, color: 'text-slate-600', bgColor: 'bg-slate-100' },
    { id: 'building', name: 'Building', nameSv: 'Bygg', icon: Building2, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'water', name: 'Water', nameSv: 'Vatten', icon: Droplets, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'electrical', name: 'Electrical', nameSv: 'El', icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { id: 'energy', name: 'Energy', nameSv: 'Energi', icon: Leaf, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { id: 'quality', name: 'Quality', nameSv: 'Kvalitet', icon: Hammer, color: 'text-orange-600', bgColor: 'bg-orange-50' },
];

const REGULATIONS: Regulation[] = [
    {
        id: 'bbr-2025',
        name: 'BBR 2025',
        fullName: 'Boverkets Byggregler 2025',
        icon: Building2,
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        description: 'Sweden\'s comprehensive building regulations covering safety, accessibility, energy efficiency, and health requirements for all construction.',
        importance: 'Compliance is mandatory for all new construction and major renovations in Sweden. Non-compliance can result in denied building permits and legal liability.',
        whatWeUse: [
            'BBR 3:1 - Accessibility requirements for doorways and thresholds',
            'BBR 5:3 - Energy performance targets (max 90 kWh/m²/year)',
            'BBR 6:2 - Fire safety compartmentalization',
            'BBR 6:5 - Structural load requirements',
            'BBR 8:4 - Sound insulation between dwellings'
        ],
        link: 'https://www.boverket.se/sv/byggande/bygga-nytt/krav/bbr/',
        category: 'building'
    },
    {
        id: 'saker-vatten',
        name: 'Säker Vatten',
        fullName: 'Säker Vatten 2021:1',
        icon: Droplets,
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        description: 'Industry standard for wet room installations ensuring waterproofing and preventing water damage - the leading cause of construction defects in Sweden.',
        importance: 'Required by most insurance companies. Installations must be performed by certified professionals. Protects against costly water damage claims.',
        whatWeUse: [
            'Certified installer requirements for all wet rooms',
            'Waterproofing membrane specifications (tätskikt)',
            'Floor drain placement and fall requirements (1:50 gradient)',
            'Wall protection height minimums (1.2m splash zone)',
            'Material certification requirements'
        ],
        link: 'https://www.sakervatten.se/',
        category: 'water'
    },
    {
        id: 'abt-06',
        name: 'ABT 06',
        fullName: 'Allmänna Bestämmelser för Totalentreprenader',
        icon: Scale,
        color: 'text-purple-700',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        description: 'Standard contract terms for turnkey construction projects in Sweden, defining responsibilities, warranties, and dispute resolution.',
        importance: 'Provides legal framework protecting both builder and client. Defines 5-year warranty period and 10-year liability for hidden defects.',
        whatWeUse: [
            'Chapter 4 - Contractor responsibility scope',
            'Chapter 5 - Warranty periods (5 years standard)',
            'Chapter 6 - Insurance requirements',
            'Chapter 7 - Payment milestones and schedules',
            'Chapter 9 - Defect liability and remediation'
        ],
        category: 'building'
    },
    {
        id: 'ss-21054',
        name: 'SS 21054:2009',
        fullName: 'Area Measurement Standard',
        icon: Ruler,
        color: 'text-amber-700',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        description: 'Swedish standard for measuring building areas (BOA, Biarea, BTA, BRA), ensuring consistent area calculations for pricing and taxation.',
        importance: 'Accurate area measurement is critical for cost estimation, property valuation, and compliance with building permits.',
        whatWeUse: [
            'BOA (Boarea) - Primary living space measurement',
            'Biarea - Secondary spaces (garage, storage)',
            'BTA (Bruttoarea) - Total building footprint',
            'Wall thickness exclusion rules',
            'Stairwell and utility space classifications'
        ],
        category: 'quality'
    },
    {
        id: 'ama-hus',
        name: 'AMA Hus',
        fullName: 'Allmän Material- och Arbetsbeskrivning för Husbyggnad',
        icon: Hammer,
        color: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        description: 'Reference specifications for materials and workmanship quality in Swedish house construction. The industry bible for construction standards.',
        importance: 'Defines acceptable quality levels and installation methods. Referenced in contracts to establish workmanship standards.',
        whatWeUse: [
            'HUS - General building requirements',
            'JSB - Foundation and ground work specs',
            'NSC - Concrete work tolerances',
            'LCS - Insulation installation standards',
            'MBE - Interior finishing quality levels'
        ],
        category: 'quality'
    },
    {
        id: 'ss-436',
        name: 'SS 436 40 00',
        fullName: 'Electrical Installation Standard',
        icon: Zap,
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        description: 'Swedish standard for low-voltage electrical installations in buildings, covering safety, capacity, and installation requirements.',
        importance: 'Electrical work must comply for safety certification. Required for Elsäkerhetsverket approval and insurance coverage.',
        whatWeUse: [
            'Minimum circuit capacity per room type',
            'Socket placement requirements (kitchen, bathroom)',
            'Earth fault protection specifications',
            'Cable dimensioning for load calculations',
            'Distribution board sizing rules'
        ],
        category: 'electrical'
    },
    {
        id: 'pbl',
        name: 'PBL',
        fullName: 'Plan- och Bygglagen',
        icon: FileText,
        color: 'text-slate-700',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-300',
        description: 'Sweden\'s Planning and Building Act - the fundamental law governing land use, building permits, and construction supervision.',
        importance: 'Defines when building permits (bygglov) are required and the legal process for construction approval.',
        whatWeUse: [
            'Building permit (bygglov) requirements',
            'Start notification (startbesked) process',
            'Construction supervisor (KA) requirements',
            'Final approval (slutbesked) criteria',
            'Permit fee calculations'
        ],
        category: 'building'
    },
    {
        id: 'eks',
        name: 'EKS/Eurocode',
        fullName: 'Eurocode with Swedish National Annex',
        icon: ShieldCheck,
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        description: 'European structural design standards adapted for Swedish conditions, covering load calculations, snow loads, and seismic requirements.',
        importance: 'Mandatory for structural calculations. Ensures buildings can withstand Swedish climate conditions and load requirements.',
        whatWeUse: [
            'Snow load calculations (regional zones)',
            'Wind load requirements',
            'Foundation design specifications',
            'Roof truss load calculations',
            'Safety factors for residential buildings'
        ],
        category: 'building'
    },
    {
        id: 'ovk',
        name: 'OVK',
        fullName: 'Obligatorisk Ventilationskontroll',
        icon: Wind,
        color: 'text-cyan-700',
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-200',
        description: 'Mandatory ventilation inspection ensuring indoor air quality and proper air exchange rates in buildings.',
        importance: 'Required before occupancy. Poor ventilation causes health issues and moisture damage. Must be recertified every 3-6 years.',
        whatWeUse: [
            'Air flow requirements per room type',
            'Kitchen exhaust minimum 10 l/s',
            'Bathroom exhaust minimum 15 l/s',
            'Supply air requirements 0.35 l/s per m²',
            'Heat recovery efficiency targets (FTX systems)'
        ],
        link: 'https://www.boverket.se/sv/byggande/halsa-och-inomhusmiljo/ventilation/ovk/',
        category: 'energy'
    },
    {
        id: 'ss-25267',
        name: 'SS 25267',
        fullName: 'Sound Classification of Dwellings',
        icon: Volume2,
        color: 'text-indigo-700',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        description: 'Swedish standard for acoustic performance in residential buildings, defining sound classes A-D for different quality levels.',
        importance: 'Class C is minimum for new construction. Sound complaints are among the most common defects in new homes.',
        whatWeUse: [
            'Airborne sound insulation between dwellings (R\'w ≥ 53 dB)',
            'Impact sound levels (L\'n,w ≤ 56 dB)',
            'Facade sound insulation requirements',
            'Installation noise limits (≤ 30 dB)',
            'Room acoustic requirements'
        ],
        category: 'quality'
    },
    {
        id: 'energidek',
        name: 'Energidek.',
        fullName: 'Energideklaration',
        icon: Leaf,
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        description: 'Mandatory energy performance certificate showing building energy use and rating (A-G scale).',
        importance: 'Required within 2 years of construction. Must be presented when selling or renting. Valid for 10 years.',
        whatWeUse: [
            'Primary energy calculation (EP_pet)',
            'Energy class determination (A-G)',
            'U-value requirements for envelope',
            'Heating system efficiency ratings',
            'Recommended improvement measures'
        ],
        link: 'https://www.boverket.se/sv/byggande/energideklaration/',
        category: 'energy'
    },
    {
        id: 'elsak-fs',
        name: 'ELSÄK-FS',
        fullName: 'Elsäkerhetsverkets Föreskrifter',
        icon: AlertTriangle,
        color: 'text-rose-700',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        description: 'Electrical safety regulations from Swedish Electrical Safety Authority covering installation requirements and safety standards.',
        importance: 'All electrical work must be performed by certified electricians. Non-compliance can void insurance and cause serious safety hazards.',
        whatWeUse: [
            'ELSÄK-FS 2022:3 - Installation requirements',
            'Certification requirements for installers',
            'Ground fault protection (30 mA RCD)',
            'Wet room electrical safety zones',
            'Inspection and documentation requirements'
        ],
        link: 'https://www.elsakerhetsverket.se/',
        category: 'electrical'
    },
    {
        id: 'radon',
        name: 'Radon',
        fullName: 'Radonskydd (BBR 6:23)',
        icon: AlertTriangle,
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        description: 'Protection requirements against radon gas, a radioactive gas from bedrock that causes lung cancer.',
        importance: 'Sweden has high radon levels in many areas. New buildings must be radon-safe with levels below 200 Bq/m³.',
        whatWeUse: [
            'Maximum indoor radon level 200 Bq/m³',
            'Radon membrane in foundation (radonspärr)',
            'Sub-slab ventilation requirements',
            'Blue concrete identification and remediation',
            'Post-construction radon measurement'
        ],
        link: 'https://www.stralsakerhetsmyndigheten.se/radon/',
        category: 'energy'
    },
    {
        id: 'ce-cpr',
        name: 'CE/CPR',
        fullName: 'Construction Products Regulation',
        icon: BadgeCheck,
        color: 'text-blue-800',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        description: 'EU regulation requiring CE marking on construction products, ensuring they meet declared performance standards.',
        importance: 'All structural and fire safety products must be CE marked. Documentation (DoP) required for building inspection.',
        whatWeUse: [
            'CE marking verification for structural products',
            'Declaration of Performance (DoP) documentation',
            'Fire classification (reaction to fire, resistance)',
            'Load-bearing capacity declarations',
            'Thermal performance declarations'
        ],
        category: 'quality'
    },
    {
        id: 'hin',
        name: 'HIN',
        fullName: 'Hindersfrihetslagen (Accessibility)',
        icon: Accessibility,
        color: 'text-teal-700',
        bgColor: 'bg-teal-50',
        borderColor: 'border-teal-200',
        description: 'Accessibility requirements ensuring buildings are usable by people with disabilities, integrated into BBR and PBL.',
        importance: 'Mandatory for all new construction. Affects door widths, thresholds, bathroom layout, and approach paths.',
        whatWeUse: [
            'Door width minimum 80 cm clear opening',
            'Threshold maximum 15 mm height',
            'Accessible bathroom requirements',
            'Ramp gradients maximum 1:12',
            'Maneuvering space requirements (1.5m turning circle)'
        ],
        link: 'https://www.boverket.se/sv/byggande/tillganglighet/',
        category: 'quality'
    },
    {
        id: 'bbv',
        name: 'BBV',
        fullName: 'Byggkeramikrådets Branschregler för Våtrum',
        icon: Droplets,
        color: 'text-sky-700',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-200',
        description: 'Industry standard for ceramic tile installation in wet rooms, complementing Säker Vatten with tile-specific requirements.',
        importance: 'Required for warranty coverage. Specifies exact methods for tile adhesion, grouting, and movement joints.',
        whatWeUse: [
            'Tile adhesive specifications (thin-bed method)',
            'Movement joint placement requirements',
            'Fall requirements toward floor drain',
            'Edge and corner sealing methods',
            'Certified installer requirements'
        ],
        link: 'https://www.bfrv.se/',
        category: 'water'
    },
    {
        id: 'gvk',
        name: 'GVK',
        fullName: 'Golvbranschens Våtrumskontroll',
        icon: CheckCircle2,
        color: 'text-violet-700',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
        description: 'Quality assurance system for floor installations in wet rooms, ensuring proper waterproofing under vinyl and similar flooring.',
        importance: 'Certification required for insurance coverage when using vinyl flooring in wet rooms instead of tiles.',
        whatWeUse: [
            'Vinyl flooring waterproofing requirements',
            'Substrate preparation standards',
            'Welded seam requirements',
            'Edge sealing specifications',
            'GVK-certified installer requirement'
        ],
        link: 'https://www.gfrv.se/',
        category: 'water'
    }
];

interface RegulationModalProps {
    regulation: Regulation;
    onClose: () => void;
}

function RegulationModal({ regulation, onClose }: RegulationModalProps) {
    const Icon = regulation.icon;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={cn("p-6 border-b", regulation.bgColor, regulation.borderColor)}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2.5 rounded-xl", regulation.bgColor, "border", regulation.borderColor)}>
                                <Icon className={cn("w-6 h-6", regulation.color)} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{regulation.name}</h3>
                                <p className="text-sm text-slate-600">{regulation.fullName}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                    {/* Description */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What is it?</h4>
                        <p className="text-sm text-slate-700 leading-relaxed">{regulation.description}</p>
                    </div>

                    {/* Importance */}
                    <div className={cn("p-4 rounded-xl border", regulation.bgColor, regulation.borderColor)}>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Why it matters</h4>
                        <p className="text-sm text-slate-700 leading-relaxed">{regulation.importance}</p>
                    </div>

                    {/* What We Use */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">What we check</h4>
                        <ul className="space-y-2">
                            {regulation.whatWeUse.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className={cn("w-4 h-4 mt-0.5 flex-shrink-0", regulation.color)} />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Link */}
                    {regulation.link && (
                        <a
                            href={regulation.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors",
                                regulation.bgColor, regulation.color, "hover:opacity-80"
                            )}
                        >
                            Learn more →
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

export function RegulationBadges() {
    const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const { language } = useTranslation();

    const filteredRegulations = activeCategory === 'all'
        ? REGULATIONS
        : REGULATIONS.filter(r => r.category === activeCategory);

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
                {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const count = cat.id === 'all'
                        ? REGULATIONS.length
                        : REGULATIONS.filter(r => r.category === cat.id).length;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                activeCategory === cat.id
                                    ? "bg-red-600 text-white shadow-md"
                                    : "bg-white/60 text-slate-600 border border-slate-200 hover:bg-white hover:shadow-sm"
                            )}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{language === 'sv' ? cat.nameSv : cat.name}</span>
                            <span className={cn(
                                "ml-0.5 px-1.5 py-0.5 rounded-full text-[10px]",
                                activeCategory === cat.id ? "bg-white/20" : "bg-slate-100"
                            )}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Filtered Badges with Staggered Animation */}
            <div className="flex flex-wrap justify-center gap-2 text-xs font-medium min-h-[40px]" key={activeCategory}>
                {filteredRegulations.map((reg, index) => {
                    const Icon = reg.icon;
                    return (
                        <button
                            key={reg.id}
                            onClick={() => setSelectedRegulation(reg)}
                            className={cn(
                                "flex items-center px-3 py-1.5 rounded-full border shadow-sm transition-all",
                                "hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
                                "bg-white/60 hover:bg-white",
                                "animate-in fade-in slide-in-from-bottom-2",
                                reg.borderColor
                            )}
                            style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}
                        >
                            <Icon className={cn("w-3.5 h-3.5 mr-1.5", reg.color)} />
                            <span className="text-slate-700">{reg.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Regulation Modal */}
            {selectedRegulation && (
                <RegulationModal
                    regulation={selectedRegulation}
                    onClose={() => setSelectedRegulation(null)}
                />
            )}
        </div>
    );
}
