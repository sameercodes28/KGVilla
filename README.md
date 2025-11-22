# KGVilla - Swedish Villa Construction Cost Calculator

Professional construction cost estimation tool for Swedish residential villa projects, featuring real-time architectural analysis and comprehensive cost breakdowns.

## 🏗️ Features

### Interactive Cost Analysis
- **Real-time Cost Calculation**: Accurate 2024 Swedish construction pricing
- **Room-by-Room Breakdown**: Detailed costs for each space
- **Phase-Based Organization**: Costs grouped by construction phase
- **Customizable Pricing**: Edit unit prices and quantities
- **Custom Cost Items**: Add builder-specific items

### Visual Floor Plan Viewer
- **Architectural Diagram Display**: View floor plans with zoom controls
- **Layer Toggles**: Show/hide electrical and plumbing overlays
- **Resizable Split-Screen**: Drag divider to adjust pane sizes
- **Interactive Highlighting**: Click cost items to highlight on plan

### Swedish Compliance
- **BBR Regulations**: Aligned with Boverket building codes
- **Electrical Standards**: SS 436 40 00 compliance
- **Plumbing Standards**: Säker Vatten regulations
- **Building Code References**: Comprehensive documentation included

### User Experience
- **Bilingual Support**: Swedish/English language toggle
- **Premium Typography**: Inter + JetBrains Mono fonts
- **Responsive Design**: Optimized for desktop use
- **Professional UI**: Minimalist, modern aesthetic

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/KGVilla.git
cd KGVilla

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
KGVilla/
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── layout.tsx        # Root layout with fonts
│   │   ├── globals.css       # Global styles (Tailwind v4)
│   │   └── qto/             # Quantity take-off page
│   ├── components/
│   │   ├── v3/              # Core components (CostCard, etc.)
│   │   ├── v5/              # Advanced components (SplitLayout, VisualViewer)
│   │   ├── qto/             # QTO-specific components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # UI primitives
│   ├── contexts/            # React contexts (Language)
│   ├── data/                # Project data and pricing
│   ├── lib/                 # Utilities
│   └── types/               # TypeScript types
├── public/                  # Static assets
│   └── hus-1405-plan.jpg   # Floor plan image
└── docs/                    # Documentation
```

## 🎨 Technology Stack

- **Framework**: Next.js 16.0.3 (with Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Fonts**: Inter (UI), JetBrains Mono (numbers)
- **Icons**: Lucide React
- **State Management**: React hooks

## 💰 Cost Categories

1. **Markarbeten** - Ground works and foundation
2. **Stomme & Tak** - Structure and roof
3. **El & Belysning** - Electrical and lighting
4. **VVS** - Plumbing, heating, ventilation
5. **Innerväggar & Isolering** - Interior walls and insulation
6. **Golv & Kakel** - Flooring and tiles
7. **Målning & Finish** - Painting and finishing
8. **Byggherrekostnader** - Client/owner costs

## 📋 Swedish Building Code Compliance

All costs are calculated based on compliance with:
- **BBR** (Boverket's Building Regulations)
- **SS 436 40 00** (Electrical installation standard)
- **Säker Vatten** (Plumbing installation regulations)
- **Eurocode** (Structural design standards)

See `docs/swedish_building_codes.md` for comprehensive references.

## 🔧 Configuration

### Environment Variables
Currently no environment variables required for basic operation.

Future backend integration will require:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (for AI vision analysis)

### Customization

**Update Project Data**: Edit `src/data/projectData.ts`
**Modify Pricing**: Adjust unit prices in the data file
**Change Floor Plan**: Replace `public/hus-1405-plan.jpg`

## 🎯 Roadmap

### Implemented ✅
- [x] Cost calculation engine
- [x] Room-by-room breakdown
- [x] Phase organization
- [x] Visual floor plan viewer
- [x] Electrical/plumbing layer toggles
- [x] Resizable split-screen
- [x] Language toggle (EN/SV)
- [x] Customizable pricing UI
- [x] Swedish building code references

### Planned 🚧
- [ ] Data persistence (Supabase)
- [ ] AI vision analysis (Google Gemini API)
- [ ] File upload for floor plans
- [ ] Multi-project support
- [ ] PDF export
- [ ] User authentication
- [ ] Project sharing

## 📖 Documentation

- **Architecture**: See `docs/architecture_and_limitations.md`
- **Building Codes**: See `docs/swedish_building_codes.md`
- **AI Strategy**: See `docs/ai_strategy.md`
- **JB Villan Data**: See `docs/jb_villan_knowledge.md`

## 🤝 Contributing

This is a private project. For questions or collaboration inquiries, please contact the repository owner.

## 📄 License

Private - All Rights Reserved

## 🙏 Acknowledgments

- **JB Villan**: Reference architectural data
- **Boverket**: Swedish building regulations
- **Elsäkerhetsverket**: Electrical safety standards
- **Säker Vatten AB**: Plumbing installation standards

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Version**: 1.0.0  
**Last Updated**: November 2024  
**Status**: Production Ready (Frontend Only)
