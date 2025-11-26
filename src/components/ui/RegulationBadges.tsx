'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Scale, Ruler, Hammer, Zap, FileText, Building2, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

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
        link: 'https://www.boverket.se/sv/byggande/bygga-nytt/krav/bbr/'
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
        link: 'https://www.sakervatten.se/'
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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
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

    return (
        <>
            <div className="flex flex-wrap justify-center gap-2 text-xs font-medium">
                {REGULATIONS.map(reg => {
                    const Icon = reg.icon;
                    return (
                        <button
                            key={reg.id}
                            onClick={() => setSelectedRegulation(reg)}
                            className={cn(
                                "flex items-center px-3 py-1.5 rounded-full border shadow-sm transition-all",
                                "hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
                                "bg-white/60 hover:bg-white",
                                reg.borderColor
                            )}
                        >
                            <Icon className={cn("w-3.5 h-3.5 mr-1.5", reg.color)} />
                            <span className="text-slate-700">{reg.name}</span>
                        </button>
                    );
                })}
            </div>

            {selectedRegulation && (
                <RegulationModal
                    regulation={selectedRegulation}
                    onClose={() => setSelectedRegulation(null)}
                />
            )}
        </>
    );
}
