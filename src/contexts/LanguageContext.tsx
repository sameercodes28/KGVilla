'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'sv';

type DictionaryEntry = { en: string; sv: string };
const dictionary: Record<string, DictionaryEntry> = {
    // Navigation
    'nav.home': { en: 'Home', sv: 'Hem' },
    'nav.project_view': { en: 'Project View', sv: 'Projektvy' },
    'nav.ai_analysis': { en: 'AI Analysis', sv: 'AI Analys' },

    // Common / Shared
    'common.loading': { en: 'Loading...', sv: 'Laddar...' },
    'common.loading_project': { en: 'Loading project...', sv: 'Laddar projekt...' },
    'common.error': { en: 'Error', sv: 'Fel' },
    'common.try_again': { en: 'Try Again', sv: 'Försök igen' },
    'common.back_home': { en: 'Back to Home', sv: 'Tillbaka till Start' },
    'common.save': { en: 'Save', sv: 'Spara' },
    'common.items': { en: 'items', sv: 'poster' },
    'common.item': { en: 'item', sv: 'post' },
    'common.regulations': { en: 'regulations', sv: 'regler' },
    'common.select_project': { en: 'Select Project', sv: 'Välj Projekt' },
    'common.open_project': { en: 'Open Project', sv: 'Öppna Projekt' },
    'common.go_home': { en: 'Go to Home', sv: 'Gå till Start' },

    // 404 Page
    'notfound.title': { en: 'Page Not Found', sv: 'Sidan hittades inte' },
    'notfound.message': { en: "The blueprint you're looking for doesn't exist in our archive.", sv: 'Ritningen du söker finns inte i vårt arkiv.' },

    // Error Fallback
    'error.title': { en: 'Blueprint Blew Away!', sv: 'Ritningen blåste bort!' },
    'error.message': { en: 'Whoops! The architect left the window open and your drawings just flew out. (We encountered an unexpected error)', sv: 'Hoppsan! Arkitekten lämnade fönstret öppet och dina ritningar flög ut. (Ett oväntat fel uppstod)' },
    'error.retry': { en: 'Catch the Blueprint (Retry)', sv: 'Fånga ritningen (Försök igen)' },
    'error.return_home': { en: 'Return to Safety (Home)', sv: 'Tillbaka till tryggheten (Start)' },
    'error.for_developer': { en: 'For the Site Foreman', sv: 'För platschefen' },
    'error.code': { en: 'Error Code:', sv: 'Felkod:' },
    'error.copied': { en: 'Debug Info Copied!', sv: 'Felsökningsinfo kopierad!' },
    'error.copy_report': { en: 'Copy Crash Report', sv: 'Kopiera felrapport' },

    // Sync Indicator
    'sync.synced': { en: 'Synced', sv: 'Synkroniserad' },
    'sync.saving': { en: 'Saving...', sv: 'Sparar...' },
    'sync.offline': { en: 'Offline (Saved locally)', sv: 'Offline (Sparad lokalt)' },

    // Visual Viewer
    'viewer.fit_view': { en: 'Fit to view', sv: 'Anpassa till vy' },
    'viewer.fit': { en: 'Fit', sv: 'Anpassa' },
    'viewer.upload_title': { en: 'Upload Floor Plan', sv: 'Ladda upp planritning' },
    'viewer.upload_desc': { en: 'Upload your architectural drawing (PDF or Image) to start the AI analysis.', sv: 'Ladda upp din arkitektritning (PDF eller bild) för att starta AI-analysen.' },
    'viewer.select_file': { en: 'Select File', sv: 'Välj fil' },
    'viewer.plan_loaded': { en: 'Floor Plan Loaded', sv: 'Planritning laddad' },
    'viewer.no_plan': { en: 'No Plan Loaded', sv: 'Ingen planritning' },
    'viewer.ready_analysis': { en: 'Ready for analysis', sv: 'Redo för analys' },
    'viewer.upload_start': { en: 'Upload to start', sv: 'Ladda upp för att börja' },
    'viewer.validating': { en: 'Validating:', sv: 'Validerar:' },
    'viewer.ready': { en: 'Ready', sv: 'Redo' },

    // Cost Inspector
    'inspector.title': { en: 'Cost Analysis', sv: 'Kostnadsanalys' },
    'inspector.subtitle': { en: 'Detailed calculation breakdown', sv: 'Detaljerad beräkningsuppdelning' },
    'inspector.confidence': { en: 'Confidence:', sv: 'Säkerhet:' },
    'inspector.how_calculated': { en: 'How We Calculated the Quantity', sv: 'Hur vi beräknade mängden' },
    'inspector.quantity_derived': { en: 'Quantity derived from AI analysis of the floor plan dimensions.', sv: 'Mängd beräknad från AI-analys av planritningens mått.' },
    'inspector.result': { en: 'Result', sv: 'Resultat' },
    'inspector.regulations': { en: 'Applicable Regulations', sv: 'Tillämpliga regelverk' },
    'inspector.section': { en: 'Section:', sv: 'Avsnitt:' },
    'inspector.price_breakdown': { en: 'Price Breakdown', sv: 'Prisuppdelning' },
    'inspector.materials': { en: 'Materials', sv: 'Material' },
    'inspector.labor': { en: 'Labor', sv: 'Arbete' },
    'inspector.includes': { en: 'Includes:', sv: 'Inkluderar:' },
    'inspector.price_source': { en: 'Price source:', sv: 'Priskälla:' },
    'inspector.ai_analysis': { en: 'AI Analysis', sv: 'AI-analys' },
    'inspector.generating': { en: 'Generating detailed analysis...', sv: 'Genererar detaljerad analys...' },
    'inspector.assumptions': { en: 'Assumptions Made:', sv: 'Antaganden:' },
    'inspector.retry': { en: 'Retry AI analysis', sv: 'Försök AI-analys igen' },
    'inspector.regenerate': { en: 'Regenerate Analysis', sv: 'Generera ny analys' },
    'inspector.based_on': { en: 'Based on BBR 2025, Säker Vatten & Swedish standards', sv: 'Baserat på BBR 2025, Säker Vatten & svenska standarder' },
    'inspector.error_ai': { en: 'Unable to generate AI explanation. Showing available data.', sv: 'Kunde inte generera AI-förklaring. Visar tillgänglig data.' },
    'inspector.cost_analysis': { en: 'Cost Analysis', sv: 'Kostnadsanalys' },
    'inspector.step_by_step': { en: 'Step-by-step breakdown', sv: 'Steg-för-steg förklaring' },
    'inspector.why_required': { en: 'Why This Is Required', sv: 'Varför detta krävs' },
    'inspector.reg_intro': { en: 'Swedish building regulations require this element:', sv: 'Svenska byggregler kräver detta element:' },
    'inspector.how_built': { en: 'How It Should Be Built', sv: 'Hur det ska byggas' },
    'inspector.spec_intro': { en: 'Construction standards specify the following:', sv: 'Byggstandarder specificerar följande:' },
    'inspector.materials_required': { en: 'Materials Required', sv: 'Material som krävs' },
    'inspector.reference_standard': { en: 'Reference Standard', sv: 'Referensstandard' },
    'inspector.quantity_calc': { en: 'Quantity Calculation', sv: 'Mängdberäkning' },
    'inspector.calc_intro': { en: 'Here\'s how we calculated the quantity from your floor plan:', sv: 'Så här beräknade vi mängden från din planritning:' },
    'inspector.from_floor_plan': { en: 'From Floor Plan', sv: 'Från planritning' },
    'inspector.calculation_method': { en: 'Calculation Method', sv: 'Beräkningsmetod' },
    'inspector.final_quantity': { en: 'Final Quantity', sv: 'Slutlig mängd' },
    'inspector.pricing': { en: 'Pricing', sv: 'Prissättning' },
    'inspector.price_intro': { en: 'Based on current Swedish market rates:', sv: 'Baserat på aktuella svenska marknadspriser:' },
    'inspector.efficiency_intro': { en: 'JB Villan offers cost efficiency on this item:', sv: 'JB Villan erbjuder kostnadseffektivitet på denna post:' },
    'inspector.unit_price': { en: 'Unit Price', sv: 'Enhetspris' },
    'inspector.why_savings': { en: 'Why You Save', sv: 'Varför du sparar' },
    'inspector.final_cost': { en: 'Final Cost', sv: 'Slutkostnad' },
    'inspector.additional_context': { en: 'Additional Context (AI)', sv: 'Ytterligare kontext (AI)' },

    // Contract Scope
    'contract.title': { en: 'Contract & Payment Plan', sv: 'Avtal & Betalningsplan' },
    'contract.subtitle': { en: 'Standard JB Villan Terms (ABT 06)', sv: 'Standard JB Villan Villkor (ABT 06)' },
    'contract.warranty': { en: '10-Year Warranty', sv: '10 års garanti' },
    'contract.warranty_desc': { en: 'Defect Liability Period', sv: 'Ansvarstid för fel' },
    'contract.fixed_price': { en: 'Fixed Price', sv: 'Fast pris' },
    'contract.fixed_price_desc': { en: 'Consumer Protection Law', sv: 'Konsumenttjänstlagen' },
    'contract.payment_schedule': { en: 'Payment Schedule (Betalningsplan)', sv: 'Betalningsplan' },
    'contract.included': { en: 'Included: Scaffolding, Dehumidifiers, Temporary Electricity, Site Cleaning, Project Management (BAS-U)', sv: 'Ingår: Byggställning, Avfuktare, Byggström, Byggstädning, Projektledning (BAS-U)' },
    'contract.excluded': { en: 'Excluded: Fine landscaping (grass/hedges) unless specified.', sv: 'Ingår ej: Finplanering (gräs/häckar) om ej specificerat.' },
    'contract.step1': { en: 'Signing & Permits', sv: 'Avtal & Bygglov' },
    'contract.step2': { en: 'Foundation Complete', sv: 'Grund klar' },
    'contract.step3': { en: 'Structure Erected (Weather-tight)', sv: 'Stomme rest (Vädertät)' },
    'contract.step4': { en: 'Interior Works', sv: 'Invändigt arbete' },
    'contract.step5': { en: 'Final Inspection (Slutbesiktning)', sv: 'Slutbesiktning' },

    // Split Layout
    'split.loading': { en: 'Loading project...', sv: 'Laddar projekt...' },
    'split.error_title': { en: 'Error Loading Project', sv: 'Fel vid laddning av projekt' },
    'split.analyzing': { en: 'AI Architect is analyzing your plan...', sv: 'AI-arkitekten analyserar din ritning...' },
    'split.identifying': { en: 'Identifying rooms, walls, and requirements.', sv: 'Identifierar rum, väggar och krav.' },

    // Phase Section
    'phase.est_total': { en: 'Est. Total', sv: 'Ber. Total' },

    // Project Header
    'header.back_home': { en: 'Back to Home', sv: 'Tillbaka till Start' },
    'header.create_new': { en: '+ Create New Project', sv: '+ Skapa Nytt Projekt' },

    // Chat Page
    'chat.loading': { en: 'Loading AI Assistant...', sv: 'Laddar AI-assistent...' },
    'chat.no_projects': { en: 'No Projects Yet', sv: 'Inga projekt ännu' },
    'chat.create_first': { en: 'Create a project first by uploading a floor plan on the home page.', sv: 'Skapa ett projekt först genom att ladda upp en planritning på startsidan.' },
    'chat.ai_assistant': { en: 'AI Assistant', sv: 'AI-assistent' },
    'chat.apply_scenario': { en: 'Apply Scenario to Project', sv: 'Tillämpa scenario på projekt' },
    'chat.add_note': { en: 'Add a note about this file...', sv: 'Lägg till en anteckning om denna fil...' },

    // Project List
    'list.select_project': { en: 'Select a Project', sv: 'Välj ett projekt' },
    'list.choose_desc': { en: 'Choose a project to view details or go back home to create a new one.', sv: 'Välj ett projekt för att se detaljer eller gå tillbaka för att skapa ett nytt.' },

    // Add Item Form
    'form.qty_error': { en: 'Quantity must be greater than 0', sv: 'Antal måste vara större än 0' },
    'form.price_error': { en: 'Price cannot be negative', sv: 'Pris kan inte vara negativt' },
    'form.placeholder': { en: 'e.g. Extra Insulation', sv: 't.ex. Extra isolering' },

    // Cost Card
    'costcard.enable': { en: 'Enable item', sv: 'Aktivera post' },
    'costcard.disable': { en: 'Disable item', sv: 'Inaktivera post' },
    'costcard.view_analysis': { en: 'View Cost Analysis', sv: 'Visa kostnadsanalys' },

    // Customer Report - Additional
    'report.more_regulations': { en: 'more regulations applied', sv: 'fler regelverk tillämpade' },
    'report.items_affected': { en: 'items affected', sv: 'poster påverkade' },
    'report.item_affected': { en: 'item affected', sv: 'post påverkad' },
    'report.more': { en: 'more', sv: 'fler' },
    'report.total': { en: 'Total', sv: 'Totalt' },
    'report.excluded_badge': { en: 'Excluded', sv: 'Exkluderad' },
    'report.modified_badge': { en: 'Modified', sv: 'Ändrad' },
    'report.added_by_you': { en: 'Added by you', sv: 'Tillagd av dig' },
    'report.scenario_proposal': { en: 'Scenario Proposal', sv: 'Scenarioförslag' },
    'report.cost_impact': { en: 'Cost Impact:', sv: 'Kostnadspåverkan:' },
    'report.total_estimate': { en: 'TOTAL ESTIMATE', sv: 'TOTAL UPPSKATTNING' },
    'report.est_cost': { en: 'Est. Cost:', sv: 'Ber. kostnad:' },
    'report.attach_floor_plan': { en: 'Attach Floor Plan', sv: 'Bifoga planritning' },
    'report.reference_standard': { en: 'Reference Standard', sv: 'Referensstandard' },

    // Dashboard / Home
    'dash.welcome': { en: 'Welcome back', sv: 'Välkommen tillbaka' },
    'dash.overview': { en: 'Here is an overview of your project', sv: 'Här är en översikt över ditt pågående projekt' },
    'dash.export': { en: 'Export Report', sv: 'Exportera Rapport' },
    'dash.new_qto': { en: 'Start New QTO', sv: 'Starta ny mängdning' },
    'dash.create_project': { en: 'Create New Project', sv: 'Skapa Nytt Projekt' },
    'dash.manage_desc': { en: 'Manage your house estimates and calculations.', sv: 'Hantera dina huskalkyler och beräkningar.' },
    'dash.my_projects': { en: 'My Projects', sv: 'Mina Projekt' },
    'dash.updated': { en: 'Updated', sv: 'Uppdaterad' },
    'dash.smart_intelligence': { en: 'Smart Construction Intelligence', sv: 'Smart Byggintelligens' },
    'dash.hero_title': { en: 'Precision Pricing for', sv: 'Precisionsprissättning för' },
    'dash.hero_subtitle': { en: 'Swedish Villas.', sv: 'Svenska Villor.' },
    'dash.hero_desc_1': { en: 'Instantly analyze blueprints against', sv: 'Analysera ritningar direkt mot' },
    'dash.hero_desc_highlight': { en: '17 Swedish building regulations', sv: '17 svenska byggregler' },
    'dash.hero_desc_2': { en: 'including BBR, Säker Vatten, EKS, and more. Generate compliant, professional quotes in seconds.', sv: 'inklusive BBR, Säker Vatten, EKS och fler. Generera regelenliga, professionella offerter på sekunder.' },
    'dash.recent_activity': { en: 'Recent Activity', sv: 'Senaste Aktivitet' },
    'dash.search_placeholder': { en: 'Search projects...', sv: 'Sök projekt...' },
    'dash.start_blueprint': { en: 'Start from a blueprint', sv: 'Börja från en ritning' },
    'dash.all_projects': { en: 'All Projects', sv: 'Alla Projekt' },
    'dash.project_name': { en: 'Project Name', sv: 'Projektnamn' },
    'dash.location': { en: 'Location', sv: 'Plats' },
    'dash.estimated_cost': { en: 'Estimated Cost', sv: 'Beräknad Kostnad' },
    'dash.status': { en: 'Status', sv: 'Status' },
    'dash.last_updated': { en: 'Last Updated', sv: 'Senast Uppdaterad' },
    'dash.actions': { en: 'Actions', sv: 'Åtgärder' },
    'dash.no_projects_found': { en: 'No projects found matching', sv: 'Inga projekt hittades som matchar' },
    'dash.delete_project': { en: 'Delete Project?', sv: 'Radera Projekt?' },
    'dash.delete_confirm': { en: 'This action cannot be undone. The project will be permanently removed.', sv: 'Denna åtgärd kan inte ångras. Projektet kommer att tas bort permanent.' },
    'dash.cancel': { en: 'Cancel', sv: 'Avbryt' },
    'dash.delete': { en: 'Delete', sv: 'Radera' },
    'dash.new_project': { en: 'New Project', sv: 'Nytt Projekt' },
    'dash.floor_plan': { en: 'Floor Plan (Recommended)', sv: 'Planritning (Rekommenderas)' },
    'dash.click_to_change': { en: 'Click to change', sv: 'Klicka för att ändra' },
    'dash.click_to_upload': { en: 'Click to upload PDF/Image', sv: 'Klicka för att ladda upp PDF/Bild' },
    'dash.drag_drop': { en: 'or drag and drop here', sv: 'eller dra och släpp här' },
    'dash.analyze_create': { en: 'Analyze & Create Project', sv: 'Analysera & Skapa Projekt' },
    'dash.create_empty': { en: 'Create Empty Project', sv: 'Skapa Tomt Projekt' },
    'dash.analyzing': { en: 'Analyzing Blueprint...', sv: 'Analyserar Ritning...' },
    'dash.checking_compliance': { en: 'Checking compliance with 17 Swedish building standards.', sv: 'Kontrollerar efterlevnad av 17 svenska byggregler.' },

    // QTO Page / Split Layout
    'qto.title': { en: 'Quantity Take-Off & Analysis', sv: 'Mängdning & Analys' },
    'qto.subtitle': { en: 'Review AI analysis of', sv: 'Granska AI-analysen av' },
    'qto.download': { en: 'Download PDF', sv: 'Ladda ner PDF' },
    'qto.total_estimate': { en: 'Total Estimate', sv: 'Total Kostnadskalkyl' },
    'qto.view_phases': { en: 'Phases', sv: 'Faser' },
    'qto.view_rooms': { en: 'Rooms', sv: 'Rum' },
    'qto.add_custom_item': { en: 'Add Custom Cost Item', sv: 'Lägg till egen kostnadspost' },
    'qto.add_new_item': { en: 'Add New Item', sv: 'Lägg till ny post' },
    'qto.item_name': { en: 'Item Name', sv: 'Benämning' },
    'qto.price': { en: 'Price (SEK)', sv: 'Pris (SEK)' },
    'qto.quantity': { en: 'Quantity', sv: 'Antal/Mängd' },
    'qto.phase': { en: 'Phase', sv: 'Fas' },
    'qto.btn_add': { en: 'Add Item', sv: 'Lägg till' },
    'qto.btn_cancel': { en: 'Cancel', sv: 'Avbryt' },
    'qto.beta': { en: 'BETA', sv: 'BETA' },
    'qto.other_custom': { en: 'Other / Custom', sv: 'Övrigt / Eget' },
    'qto.general_unassigned': { en: 'General / Unassigned', sv: 'Allmänt / Ej tilldelat' },
    'qto.new_project': { en: 'New Project', sv: 'Nytt Projekt' },
    'qto.items': { en: 'Items', sv: 'Poster' },
    'qto.total': { en: 'Total', sv: 'Totalt' },
    'qto.room_breakdown': { en: 'Room Breakdown', sv: 'Rumsfördelning' },

    // Client Costs
    'client.title': { en: 'Client Costs (Byggherrekostnader)', sv: 'Byggherrekostnader' },
    'client.desc': { en: 'Fees, permits, and connections paid directly by you.', sv: 'Avgifter, lov och anslutningar som betalas direkt av dig.' },
    'client.est_total': { en: 'Est. Total', sv: 'Est. Totalt' },
    'client.warning_title': { en: "These are YOUR costs, not JB Villan's", sv: 'Det här är DINA kostnader, inte JB Villans' },
    'client.warning_desc': { en: "These fees are paid directly by you to government agencies, utilities, and service providers. They are NOT included in the contractor's turnkey price above.", sv: 'Dessa avgifter betalas direkt av dig till myndigheter, energibolag och tjänsteleverantörer. De ingår INTE i entreprenörens nyckelfärdiga pris ovan.' },

    // Client Costs Items
    'cost.lagfart': { en: 'Title Deed (Lagfart)', sv: 'Lagfart' },
    'cost.lagfart_desc': { en: 'Stamp duty (1.5% of purchase price) + admin fee', sv: 'Stämpelskatt (1.5% av köpeskilling) + exp.avgift' },
    'cost.pantbrev': { en: 'Mortgage Deed (Pantbrev)', sv: 'Pantbrev' },
    'cost.pantbrev_desc': { en: 'Stamp duty (2% of mortgage) + admin fee', sv: 'Stämpelskatt (2% av pantbrev) + exp.avgift' },
    'cost.bygglov': { en: 'Building Permit (Bygglov)', sv: 'Bygglov & Planavgift' },
    'cost.bygglov_desc': { en: 'Municipal fee for permit handling', sv: 'Kommunal avgift för bygglovshantering' },
    'cost.karta': { en: 'Site Map (Nybyggnadskarta)', sv: 'Nybyggnadskarta' },
    'cost.karta_desc': { en: 'Basis for the site plan', sv: 'Underlag för situationsplan' },
    'cost.utstakning': { en: 'Staking out (Utstakning)', sv: 'Utstakning' },
    'cost.utstakning_desc': { en: 'Rough and fine staking of the house position', sv: 'Grov- och finutstakning' },
    'cost.ka': { en: 'Inspection Manager (KA)', sv: 'Kontrollansvarig (KA)' },
    'cost.ka_desc': { en: 'Certified inspector required by PBL', sv: 'Certifierad kontrollansvarig enl. PBL' },
    'cost.el': { en: 'Electricity Connection', sv: 'Elanslutning' },
    'cost.el_desc': { en: 'Connection fee (16-25A)', sv: 'Anslutningsavgift till nätägare (16-25A)' },
    'cost.fiber': { en: 'Fiber Connection', sv: 'Fiberanslutning' },
    'cost.fiber_desc': { en: 'Installation and connection', sv: 'Installation av fiber' },
    'cost.vatten': { en: 'Water & Sewage Connection', sv: 'VA-anslutning' },
    'cost.vatten_desc': { en: 'Municipal connection fee', sv: 'Kommunal anslutningsavgift' },
    'cost.byggstrom': { en: 'Construction Electricity', sv: 'Byggström' },
    'cost.byggstrom_desc': { en: 'Rental of cabinet + consumption', sv: 'Hyra av byggskåp + förbrukning' },
    'cost.forsakring': { en: 'Construction Insurance', sv: 'Byggförsäkring' },
    'cost.forsakring_desc': { en: 'During construction period', sv: 'Under byggtiden' },

    // Cost Items
    'item.item-mark-01': { en: 'Site Setup & Excavation', sv: 'Etablering & Schaktning' },
    'item.item-mark-01_desc': { en: 'Setup, rough excavation for slab on grade, removal of masses.', sv: 'Etablering, grovschaktning för platta på mark, bortforsling av massor.' },
    
    'item.item-mark-02': { en: 'Foundation (Slab on Grade)', sv: 'Grundläggning (Platta på mark)' },
    'item.item-mark-02_desc': { en: 'Insulated concrete slab incl. reinforcement, edge elements and casting.', sv: 'Isolerad betongplatta inkl. armering, kantelement och gjutning.' },
    
    'item.item-mark-03': { en: 'Water/Sewage & Drainage (External)', sv: 'VA & Dränering (Utvändigt)' },
    'item.item-mark-03_desc': { en: 'Connection to municipal grid, stormwater cassettes, foundation drainage.', sv: 'Anslutning till kommunalt VA, dagvattenkassetter och dränering runt grund.' },

    'item.item-stom-01': { en: 'Exterior Walls (Prefab)', sv: 'Ytterväggar (Prefab)' },
    'item.item-stom-01_desc': { en: 'Prefabricated wall blocks, 195mm wood frame, insulation, wind barrier.', sv: 'Färdiga väggblock, trästomme 195mm, isolering, vindduk.' },

    'item.item-stom-02': { en: 'Trusses & Roof', sv: 'Takstolar & Yttertak' },
    'item.item-stom-02_desc': { en: 'Trusses, tongue & groove, felt, battens and concrete tiles.', sv: 'Takstolar, råspont, papp, läkt och betongpannor (Benders).' },

    'item.item-stom-03': { en: 'Windows & External Doors', sv: 'Fönster & Ytterdörrar' },
    'item.item-stom-03_desc': { en: 'Triple-glazed windows, Diplomat entrance door.', sv: 'Elitfönster 3-glas isoler, Entrédörr Diplomat.' },

    'item.item-el-k-01': { en: 'Power Outlets (Kitchen)', sv: 'Eluttag (Kök)' },
    'item.item-el-k-01_desc': { en: '2-way grounded wall sockets.', sv: 'Vägguttag 2-vägs jordat (Schneider Exxact).' },

    'item.item-el-k-02': { en: 'Spotlights (Kitchen)', sv: 'Belysning Spotlights (Kök)' },
    'item.item-el-k-02_desc': { en: 'Recessed LED spotlights incl. driver.', sv: 'Infällda LED-spotlights inkl. drivdon.' },

    'item.item-el-v-01': { en: 'Power Outlets (Living Room)', sv: 'Eluttag (Vardagsrum)' },
    'item.item-el-v-01_desc': { en: '2-way grounded wall sockets.', sv: 'Vägguttag 2-vägs jordat.' },

    'item.item-el-s-01': { en: 'Power Outlets (Bedrooms)', sv: 'Eluttag (Sovrum)' },
    'item.item-el-s-01_desc': { en: '2-way grounded wall sockets (4 per room).', sv: 'Vägguttag 2-vägs jordat (4 per rum).' },

    'item.item-el-01': { en: 'Distribution Board & Meter', sv: 'Elcentral & Mätarskåp' },
    'item.item-el-01_desc': { en: 'Meter cabinet + Media enclosure + Fuse box with RCD.', sv: 'Fasadmätarskåp + Mediacentral + Normcentral med JFB.' },

    'item.item-vvs-01': { en: 'Underfloor Heating (Water)', sv: 'Vattenburen Golvvärme' },
    'item.item-vvs-01_desc': { en: 'Complete system incl. manifold, pipes and thermostats.', sv: 'Komplett system inkl. fördelare, rör och termostater (Thermotech).' },

    'item.item-vvs-02': { en: 'Heat Pump (Exhaust Air)', sv: 'Värmepump (Frånluft)' },
    'item.item-vvs-02_desc': { en: 'NIBE F730 Exhaust Air Heat Pump incl. installation.', sv: 'NIBE F730 Frånluftsvärmepump inkl. installation.' },

    'item.item-vvs-b1-01': { en: 'WC (Bathroom 1)', sv: 'WC-stol (Badrum 1)' },
    'item.item-vvs-b1-01_desc': { en: 'Wall-hung toilet incl. fixture.', sv: 'Gustavsberg Nautic vägghängd inkl. fixtur.' },

    'item.item-vvs-b1-02': { en: 'Washbasin Mixer (Bathroom 1)', sv: 'Tvättställsblandare (Badrum 1)' },
    'item.item-vvs-b1-02_desc': { en: 'Mora MMIX mixer.', sv: 'Mora MMIX.' },

    'item.item-vvs-b1-03': { en: 'Shower Walls & Mixer', sv: 'Duschväggar & Blandare' },
    'item.item-vvs-b1-03_desc': { en: 'INR Linc walls + Mora MMIX overhead shower.', sv: 'INR Linc + Mora MMIX takdusch.' },

    'item.item-int-01': { en: 'Parquet Flooring', sv: 'Parkettgolv (Kährs)' },
    'item.item-int-01_desc': { en: 'Oak 3-strip, 15mm.', sv: 'Kährs Ek 3-stav, 15mm.' },

    'item.item-int-02': { en: 'Tiles (Bath/Hall)', sv: 'Klinker & Kakel (Badrum/Hall)' },
    'item.item-int-02_desc': { en: 'Labor cost + material average.', sv: 'Arbetskostnad + material (snittpris).' },

    'item.item-int-03': { en: 'Interior Doors', sv: 'Innerdörrar' },
    'item.item-int-03_desc': { en: 'Smooth white door incl. frame and handle.', sv: 'Swedoor slät vit inkl. karm och trycke.' },

    'item.item-int-04': { en: 'Kitchen Fittings', sv: 'Köksinredning' },
    'item.item-int-04_desc': { en: 'Standard kitchen cabinets incl. assembly.', sv: 'Ballingslöv eller Marbodal standardkök inkl. montering.' },

    'item.item-int-05': { en: 'Appliances', sv: 'Vitvaror' },
    'item.item-int-05_desc': { en: 'Siemens package (Fridge, Freezer, Oven, Hob, DW).', sv: 'Siemens paket (Kyl, Frys, Ugn, Häll, DM).' },

    // Backend-generated item translations (new OCR service IDs)
    'item.ground-excavation': { en: 'Excavation & Site Preparation', sv: 'Schaktning & Markberedning' },
    'item.ground-excavation_desc': { en: 'Ground preparation, leveling', sv: 'Markberedning, utjämning' },
    'item.ground-foundation': { en: 'Foundation (Slab on Grade)', sv: 'Grundläggning (Platta på mark)' },
    'item.ground-foundation_desc': { en: 'Insulated slab on grade with 300mm EPS under, 100mm edge insulation. Includes reinforcement mesh, radon barrier, and underfloor heating pipes preparation. JB Villan prefab efficiency: standardized slab design.', sv: 'Isolerad platta på mark med 300mm EPS under, 100mm kantisolering. Inkluderar armeringsnät, radonspärr och förberedelse för golvvärmerör. JB Villan prefab-effektivitet: standardiserad plattdesign.' },
    'item.ground-drainage': { en: 'Perimeter Drainage', sv: 'Dränering' },
    'item.ground-drainage_desc': { en: 'Drainage system around building', sv: 'Dräneringssystem runt byggnaden' },
    'item.structure-roof': { en: 'Roof Structure & Covering', sv: 'Takstomme & Täckning' },
    'item.structure-roof_desc': { en: 'Pitched roof with tiles. JB Villan prefab efficiency: pre-assembled roof trusses from factory.', sv: 'Sadeltak med takpannor. JB Villan prefab-effektivitet: förmonterade takstolar från fabrik.' },
    'item.structure-ext-walls': { en: 'Exterior Walls', sv: 'Ytterväggar' },
    'item.structure-ext-walls_desc': { en: 'Timber frame 45x220mm + 45x45mm service layer. Mineral wool insulation U-value ≤0.18 W/m²K per BBR 9. JB Villan prefab efficiency: factory-assembled wall panels.', sv: 'Trästomme 45x220mm + 45x45mm installationsvägg. Mineralull isolering U-värde ≤0.18 W/m²K enligt BBR 9. JB Villan prefab-effektivitet: fabriksmonterade väggpaneler.' },
    'item.structure-insulation': { en: 'Additional Insulation', sv: 'Tilläggsisolering' },
    'item.structure-insulation_desc': { en: 'Additional insulation for improved energy performance', sv: 'Tilläggsisolering för förbättrad energiprestanda' },
    'item.structure-facade': { en: 'Facade Cladding', sv: 'Fasadbeklädnad' },
    'item.structure-facade_desc': { en: 'Exterior facade cladding and finishing', sv: 'Utvändig fasadbeklädnad och ytskikt' },
    'item.structure-ext-paint': { en: 'Exterior Painting', sv: 'Utvändig Målning' },
    'item.structure-ext-paint_desc': { en: 'Exterior painting and surface treatment', sv: 'Utvändig målning och ytbehandling' },
    'item.structure-gutters': { en: 'Gutters & Downpipes', sv: 'Hängrännor & Stuprör' },
    'item.structure-gutters_desc': { en: 'Complete gutter and downpipe system', sv: 'Komplett system för hängrännor och stuprör' },
    'item.structure-soffit': { en: 'Soffit & Fascia', sv: 'Vindskivor & Takkant' },
    'item.structure-soffit_desc': { en: 'Soffit boards and fascia trim', sv: 'Vindskivor och takkantsklädsel' },
    'item.structure-windows': { en: 'Windows', sv: 'Fönster' },
    'item.structure-windows_desc': { en: 'Triple-glazed windows with U-value ≤1.0', sv: 'Treglasfönster med U-värde ≤1.0' },
    'item.structure-ext-door': { en: 'Exterior Door', sv: 'Ytterdörr' },
    'item.structure-ext-door_desc': { en: 'Insulated exterior door with security lock', sv: 'Isolerad ytterdörr med säkerhetslås' },
    'item.structure-patio-door': { en: 'Patio Door', sv: 'Altandörr' },
    'item.structure-patio-door_desc': { en: 'Patio door with triple glazing', sv: 'Altandörr med treglas' },
    'item.interior-flooring': { en: 'Flooring', sv: 'Golvbeläggning' },
    'item.interior-flooring_desc': { en: 'Interior flooring installation', sv: 'Installation av inomhusgolv' },
    'item.interior-wet-walls': { en: 'Wet Room Walls', sv: 'Våtrumsväggar' },
    'item.interior-wet-walls_desc': { en: 'Waterproof wall system for wet rooms', sv: 'Vattentätt väggsystem för våtrum' },
    'item.interior-standard-walls': { en: 'Standard Room Walls', sv: 'Väggar (Standard)' },
    'item.interior-standard-walls_desc': { en: 'Gypsum board walls with painting', sv: 'Gipsskivor med målning' },
    'item.interior-ceiling': { en: 'Ceiling Finishing', sv: 'Takbeklädnad' },
    'item.interior-ceiling_desc': { en: 'Interior ceiling finishing', sv: 'Invändig takbeklädnad' },
    'item.interior-doors': { en: 'Interior Doors', sv: 'Innerdörrar' },
    'item.interior-doors_desc': { en: 'Interior doors with frames and hardware', sv: 'Innerdörrar med karmar och beslag' },
    'item.interior-kitchen': { en: 'Kitchen Installation', sv: 'Köksinstallation' },
    'item.interior-kitchen_desc': { en: 'Complete kitchen installation', sv: 'Komplett köksinstallation' },
    'item.interior-bath-accessories': { en: 'Bathroom Accessories', sv: 'Badrumstillbehör' },
    'item.interior-bath-accessories_desc': { en: 'Bathroom fixtures and accessories', sv: 'Badrumsarmaturer och tillbehör' },
    'item.interior-wardrobes': { en: 'Built-in Wardrobes', sv: 'Inbyggda Garderober' },
    'item.interior-wardrobes_desc': { en: 'Built-in wardrobe systems', sv: 'Inbyggda garderobssystem' },
    'item.interior-appliances': { en: 'Kitchen & Laundry Appliances', sv: 'Vitvaror (Kök & Tvätt)' },
    'item.interior-appliances_desc': { en: 'Kitchen and laundry appliances', sv: 'Vitvaror för kök och tvätt' },
    'item.interior-trim': { en: 'Interior Trim & Moldings', sv: 'Lister & Inramningar' },
    'item.interior-trim_desc': { en: 'Interior trim, baseboards and moldings', sv: 'Inomhuslister, golvlister och taklister' },
    'item.plumbing-wc': { en: 'WC Installation', sv: 'WC-installation' },
    'item.plumbing-wc_desc': { en: 'Toilet installation complete', sv: 'Komplett toalettinstallation' },
    'item.plumbing-basin': { en: 'Washbasin & Mixer', sv: 'Handfat & Blandare' },
    'item.plumbing-basin_desc': { en: 'Washbasin with mixer tap', sv: 'Handfat med blandare' },
    'item.plumbing-shower': { en: 'Shower Installation', sv: 'Duschinstallation' },
    'item.plumbing-shower_desc': { en: 'Complete shower installation', sv: 'Komplett duschinstallation' },
    'item.plumbing-drain': { en: 'Floor Drains', sv: 'Golvbrunnar' },
    'item.plumbing-drain_desc': { en: 'Floor drains for wet rooms', sv: 'Golvbrunnar för våtrum' },
    'item.plumbing-base': { en: 'Plumbing System', sv: 'VVS-system' },
    'item.plumbing-base_desc': { en: 'Main plumbing system and pipes', sv: 'Huvudsakligt VVS-system och rör' },
    'item.plumbing-waterheater': { en: 'Water Heater', sv: 'Varmvattenberedare' },
    'item.plumbing-waterheater_desc': { en: 'Hot water system', sv: 'Varmvattensystem' },
    'item.hvac-heatpump': { en: 'Heat Pump', sv: 'Värmepump' },
    'item.hvac-heatpump_desc': { en: 'Heat pump installation', sv: 'Värmepumpsinstallation' },
    'item.hvac-underfloor': { en: 'Underfloor Heating', sv: 'Golvvärme' },
    'item.hvac-underfloor_desc': { en: 'Underfloor heating system', sv: 'Golvvärmesystem' },
    'item.hvac-radiators': { en: 'Radiators', sv: 'Radiatorer' },
    'item.hvac-radiators_desc': { en: 'Radiator heating system', sv: 'Radiatorvärmesystem' },
    'item.hvac-ventilation': { en: 'FTX Ventilation System', sv: 'FTX Ventilationssystem' },
    'item.hvac-ventilation_desc': { en: 'Heat recovery ventilation system', sv: 'Ventilationssystem med värmeåtervinning' },
    'item.electrical-panel': { en: 'Distribution Board', sv: 'Elcentral' },
    'item.electrical-panel_desc': { en: 'Main electrical distribution board', sv: 'Huvudelcentral' },
    'item.electrical-sockets': { en: 'Electrical Points', sv: 'Eluttag' },
    'item.electrical-sockets_desc': { en: 'Electrical outlets and switches', sv: 'Eluttag och strömbrytare' },
    'item.electrical-lighting': { en: 'Lighting Fixtures', sv: 'Belysning' },
    'item.electrical-lighting_desc': { en: 'Interior lighting fixtures', sv: 'Invändiga belysningsarmaturer' },
    'item.completion-terrace': { en: 'Terrace/Deck', sv: 'Terrass/Altan' },
    'item.completion-terrace_desc': { en: 'Outdoor terrace or deck', sv: 'Utomhusterrass eller altan' },
    'item.admin-va-connection': { en: 'Water/Sewer Connection', sv: 'VA-anslutning' },
    'item.admin-va-connection_desc': { en: 'Municipal water and sewer connection', sv: 'Kommunal vatten- och avloppsanslutning' },
    'item.admin-el-connection': { en: 'Electrical Grid Connection', sv: 'El-anslutning' },
    'item.admin-el-connection_desc': { en: 'Connection to electrical grid', sv: 'Anslutning till elnätet' },
    'item.admin-insurance': { en: 'Construction Insurance', sv: 'Byggförsäkring' },
    'item.admin-insurance_desc': { en: 'Construction period insurance', sv: 'Försäkring under byggtiden' },
    'item.admin-klimat': { en: 'Climate Declaration (LCA)', sv: 'Klimatdeklaration' },
    'item.admin-klimat_desc': { en: 'Climate declaration per building regulations', sv: 'Klimatdeklaration enligt byggregler' },
    'item.admin-ka': { en: 'Site Inspector (KA)', sv: 'Kontrollansvarig (KA)' },
    'item.admin-ka_desc': { en: 'Certified site inspector per PBL', sv: 'Certifierad kontrollansvarig enligt PBL' },
    'item.admin-bygglov': { en: 'Building Permit', sv: 'Bygglov' },
    'item.admin-bygglov_desc': { en: 'Building permit fees', sv: 'Bygglovsavgifter' },
    'item.admin-mgmt': { en: 'Project Management', sv: 'Projektledning' },
    'item.admin-mgmt_desc': { en: 'Project management services', sv: 'Projektledningstjänster' },
    'item.admin-site-overhead': { en: 'Site Overhead', sv: 'Arbetsplatsomkostnader' },
    'item.admin-site-overhead_desc': { en: 'Site overhead and establishment costs', sv: 'Arbetsplatsomkostnader och etablering' },
    'item.admin-contingency': { en: 'Contingency', sv: 'Oförutsett' },
    'item.admin-contingency_desc': { en: 'Contingency for unforeseen costs', sv: 'Reserv för oförutsedda kostnader' },

    // Phases
    'phase.ground': { en: 'Ground Works', sv: 'Markarbeten' },
    'phase.structure': { en: 'Structure & Roof', sv: 'Stomme & Tak' },
    'phase.electrical': { en: 'Electrical', sv: 'El & Belysning' },
    'phase.plumbing': { en: 'Plumbing & HVAC', sv: 'VVS & Värme' },
    'phase.interior': { en: 'Interior & Kitchen', sv: 'Invändigt & Kök' },
    'phase.completion': { en: 'Completion & Admin', sv: 'Slutförande & Administration' },
    'phase.admin': { en: 'Administrative Costs', sv: 'Administrativa kostnader' },
    // Cost Card
    'card.qty': { en: 'Qty:', sv: 'Antal:' },
    'card.price': { en: 'Price:', sv: 'Pris:' },
    'card.select_option': { en: 'Select Option', sv: 'Välj Alternativ' },
    'card.breakdown': { en: 'Estimated Breakdown', sv: 'Kostnadsfördelning' },
    'card.materials': { en: 'Materials', sv: 'Material' },
    'card.labor': { en: 'Labor', sv: 'Arbete' },
    'card.ai_calculation': { en: 'AI Calculation', sv: 'AI-Beräkning' },
    'card.guideline': { en: 'Guideline', sv: 'Riktlinje' },
    'card.custom': { en: 'Custom', sv: 'Egen' },
    'card.edited': { en: 'Edited', sv: 'Ändrad' },
    'card.regulations': { en: 'Applicable Regulations', sv: 'Tillämpliga Regelverk' },
    'card.excluded': { en: 'Excluded', sv: 'Exkluderad' },
    'card.enable': { en: 'Enable item', sv: 'Aktivera post' },
    'card.disable': { en: 'Disable item', sv: 'Inaktivera post' },

    // JB Villan Prefab Section
    'prefab.title': { en: 'JB Villan Prefab Efficiency', sv: 'JB Villan Prefab-effektivitet' },
    'prefab.badge': { en: 'Prefab', sv: 'Prefab' },
    'prefab.general_contractor': { en: 'General Contractor Price', sv: 'Entreprenörspris' },
    'prefab.jb_price': { en: 'JB Villan Price', sv: 'JB Villan-pris' },
    'prefab.you_save': { en: 'You save:', sv: 'Du sparar:' },
    'prefab.your_savings': { en: 'Your Savings', sv: 'Din Besparing' },
    'prefab.market_rate': { en: '2025 market rate', sv: '2025 marknadspris' },
    'prefab.factory_optimized': { en: 'Factory-optimized', sv: 'Fabriksoptimerad' },
    'prefab.why_cheaper': { en: 'Why JB Villan is cheaper', sv: 'Varför JB Villan är billigare' },
    'prefab.benefit_waste': { en: 'Factory manufacturing reduces waste and labor costs', sv: 'Fabrikstillverkning minskar spill och arbetskostnader' },
    'prefab.benefit_bulk': { en: 'Bulk purchasing power for materials', sv: 'Volymfördelar vid materialinköp' },
    'prefab.benefit_standard': { en: 'Standardized processes increase efficiency', sv: 'Standardiserade processer ökar effektiviteten' },
    'prefab.advantage_title': { en: 'JB Villan Prefab Advantage', sv: 'JB Villan Prefab-fördel' },
    'prefab.contractor_charge': { en: 'A general contractor would charge approximately', sv: 'En generalentreprenör skulle ta ungefär' },
    'prefab.for_this_build': { en: 'for this build based on 2025 market rates.', sv: 'för denna byggnation baserat på 2025 marknadspriser.' },
    'prefab.savings_percent': { en: 'savings', sv: 'besparing' },

    // Customer Report / Quote
    'report.quote': { en: 'Quote', sv: 'Offert' },
    'report.title': { en: 'Project Quote', sv: 'Projektoffert' },
    'report.ready': { en: 'Quote Ready', sv: 'Offert Klar' },
    'report.back': { en: 'Back to Editor', sv: 'Tillbaka till Redigering' },
    'report.loading': { en: 'Loading quote...', sv: 'Laddar offert...' },
    'report.turnkey': { en: 'Turnkey Price (Totalentreprenad)', sv: 'Totalpris (Totalentreprenad)' },
    'report.total_investment': { en: 'Total Investment', sv: 'Total Investering' },
    'report.cost_per_sqm': { en: 'Cost per m²', sv: 'Kostnad per m²' },
    'report.living_area': { en: 'Living Area (BOA)', sv: 'Boarea (BOA)' },
    'report.secondary_area': { en: 'Secondary Area', sv: 'Biarea' },
    'report.total_area': { en: 'Total Area', sv: 'Total Yta' },
    'report.regulations_count': { en: 'Regulations Applied', sv: 'Tillämpade Regelverk' },
    'report.items_count': { en: 'Cost Items', sv: 'Kostnadsposter' },
    'report.where_money_goes': { en: 'Where Your Money Goes', sv: 'Vart Pengarna Går' },
    'report.cost_breakdown': { en: 'Detailed Cost Breakdown', sv: 'Detaljerad Kostnadsuppdelning' },
    'report.phase_items': { en: 'items', sv: 'poster' },
    'report.view_details': { en: 'View Details', sv: 'Visa Detaljer' },
    'report.hide_details': { en: 'Hide Details', sv: 'Dölj Detaljer' },
    'report.material_labor': { en: 'Material & Labor included', sv: 'Material & Arbete ingår' },
    'report.compliance_title': { en: 'Regulatory Compliance', sv: 'Regelefterlevnad' },
    'report.compliance_subtitle': { en: 'This project meets all applicable Swedish building standards', sv: 'Detta projekt uppfyller alla tillämpliga svenska byggregler' },
    'report.decisions_title': { en: 'Your Decisions', sv: 'Dina Val' },
    'report.decisions_subtitle': { en: 'Customizations and choices made for this project', sv: 'Anpassningar och val gjorda för detta projekt' },
    'report.excluded_items': { en: 'Excluded Items', sv: 'Exkluderade Poster' },
    'report.custom_items': { en: 'Custom Items Added', sv: 'Egna Tillagda Poster' },
    'report.custom_pricing': { en: 'Custom Pricing Applied', sv: 'Egen Prissättning' },
    'report.no_changes': { en: 'No customizations made - using standard pricing', sv: 'Inga anpassningar gjorda - standardpriser används' },
    'report.warranty_title': { en: '10-Year Warranty', sv: '10 Års Garanti' },
    'report.warranty_desc': { en: 'Full defect liability protection under Konsumenttjänstlagen.', sv: 'Fullständigt ansvar för fel enligt Konsumenttjänstlagen.' },
    'report.fixed_price_title': { en: 'Fixed Price Contract', sv: 'Fast Pris' },
    'report.fixed_price_desc': { en: 'No hidden fees. ABT 06 standard contract for your peace of mind.', sv: 'Inga dolda kostnader. ABT 06 standardavtal för din trygghet.' },
    'report.turnkey_title': { en: 'Turnkey Delivery', sv: 'Nyckelfärdig Leverans' },
    'report.turnkey_desc': { en: 'We handle everything from permits (Bygglov) to final cleaning.', sv: 'Vi hanterar allt från bygglov till slutstädning.' },
    'report.cta_title': { en: 'Ready to proceed?', sv: 'Redo att gå vidare?' },
    'report.download_pdf': { en: 'Download PDF Quote', sv: 'Ladda ner PDF-offert' },
    'report.contact': { en: 'Contact Builder', sv: 'Kontakta Byggare' },
    'report.generated': { en: 'Generated with', sv: 'Genererad med' },
    'report.disclaimer': { en: 'This quote is an estimate based on AI analysis. Final pricing may vary based on site conditions and material specifications.', sv: 'Denna offert är en uppskattning baserad på AI-analys. Slutligt pris kan variera beroende på platsförhållanden och materialspecifikationer.' },
    'report.floor_plan': { en: 'Your Floor Plan', sv: 'Din Planritning' },
    'report.floor_plan_desc': { en: 'The analyzed floor plan used to generate this quote', sv: 'Den analyserade planritningen som använts för att generera denna offert' },

    // Total Summary
    'summary.title': { en: 'Total Estimated Cost', sv: 'Total Beräknad Kostnad' },
    'summary.subtitle': { en: 'Includes material, labor, and VAT (25%)', sv: 'Inkluderar material, arbete och moms (25%)' },
    
    // AI Chat
    'chat.title': { en: 'AI Project Consultant', sv: 'AI Projektkonsult' },
    'chat.subtitle': { en: 'Expert in Swedish building regulations & costs', sv: 'Expert på svenska byggregler & kostnader' },
    'chat.placeholder': { en: 'Ask about budget, BBR regulations, or savings...', sv: 'Fråga om budget, BBR-regler eller besparingar...' },
    'chat.welcome': { en: 'Hi! I can help you optimize your budget. Try asking: "How can I reduce the total cost by 500,000 SEK?"', sv: 'Hej! Jag kan hjälpa dig att optimera din budget. Prova att fråga: "Hur kan jag minska totalkostnaden med 500 000 kr?"' },
    'chat.typing': { en: 'AI is thinking...', sv: 'AI tänker...' },

    // Cost Table (Legacy View)
    'cost.title': { en: 'Cost Breakdown', sv: 'Mängdförteckning' },
    'cost.export_excel': { en: 'Export Excel', sv: 'Exportera Excel' },
    'cost.save': { en: 'Save Changes', sv: 'Spara ändringar' },
    'cost.col.element': { en: 'Element / Material', sv: 'Byggdel / Material' },
    'cost.col.quantity': { en: 'Qty (Net)', sv: 'Mängd (Netto)' },
    'cost.col.unit': { en: 'Unit', sv: 'Enhet' },
    'cost.col.waste': { en: 'Waste (%)', sv: 'Spill (%)' },
    'cost.col.total': { en: 'Total (Gross)', sv: 'Totalt (Brutto)' },
    'cost.col.status': { en: 'Status', sv: 'Status' },
    'cost.col.source': { en: 'Price Source', sv: 'Priskälla' },
    'cost.col.cost': { en: 'Total Cost', sv: 'Total Kostnad' },

    // Assumption Dashboard
    'assump.title': { en: 'AI Assumptions & Alerts', sv: 'AI Antaganden & Avvikelser' },
    'assump.review': { en: 'to review', sv: 'att granska' },
    'assump.confidence': { en: 'confidence', sv: 'säkerhet' },
    'assump.suggested': { en: 'SUGGESTED VALUE:', sv: 'FÖRESLAGET VÄRDE:' },

    // Room Names (Swedish -> English)
    'room.VARDAGSRUM': { en: 'Living Room', sv: 'VARDAGSRUM' },
    'room.V.RUM': { en: 'Living Room', sv: 'V.RUM' },
    'room.ALLRUM': { en: 'Family Room', sv: 'ALLRUM' },
    'room.KÖK': { en: 'Kitchen', sv: 'KÖK' },
    'room.MATPLATS': { en: 'Dining Area', sv: 'MATPLATS' },
    'room.KÖK/VARDAGSRUM': { en: 'Kitchen/Living Room', sv: 'KÖK/VARDAGSRUM' },
    'room.KÖK/MATPLATS': { en: 'Kitchen/Dining', sv: 'KÖK/MATPLATS' },
    'room.MATPLATS / VARDAGSRUM': { en: 'Dining/Living Room', sv: 'MATPLATS / VARDAGSRUM' },
    'room.SOVRUM': { en: 'Bedroom', sv: 'SOVRUM' },
    'room.SOV': { en: 'Bedroom', sv: 'SOV' },
    'room.EV. SOV': { en: 'Possible Bedroom', sv: 'EV. SOV' },
    'room.ENTRÉ': { en: 'Entry', sv: 'ENTRÉ' },
    'room.ENTRE': { en: 'Entry', sv: 'ENTRE' },
    'room.HALL': { en: 'Hall', sv: 'HALL' },
    'room.WC/D': { en: 'Bathroom', sv: 'WC/D' },
    'room.WC/BAD': { en: 'Bathroom', sv: 'WC/BAD' },
    'room.BAD': { en: 'Bathroom', sv: 'BAD' },
    'room.BADRUM': { en: 'Bathroom', sv: 'BADRUM' },
    'room.TVÄTT': { en: 'Laundry', sv: 'TVÄTT' },
    'room.TVÄTTSTUGA': { en: 'Laundry Room', sv: 'TVÄTTSTUGA' },
    'room.GROVENTRÉ': { en: 'Utility Entry', sv: 'GROVENTRÉ' },
    'room.GROVENTRÉ / TVÄTT': { en: 'Utility/Laundry', sv: 'GROVENTRÉ / TVÄTT' },
    'room.TVÄTT / GROVENTRÉ': { en: 'Laundry/Utility', sv: 'TVÄTT / GROVENTRÉ' },
    'room.FÖRRÅD': { en: 'Storage', sv: 'FÖRRÅD' },
    'room.KLK': { en: 'Closet', sv: 'KLK' },
    'room.KLÄDKAMMARE': { en: 'Walk-in Closet', sv: 'KLÄDKAMMARE' },
    'room.GARAGE': { en: 'Garage', sv: 'GARAGE' },
    'room.GARAGE/FÖRRÅD': { en: 'Garage/Storage', sv: 'GARAGE/FÖRRÅD' },
    'room.TEKNIK': { en: 'Technical Room', sv: 'TEKNIK' },
    'room.ALTAN': { en: 'Terrace', sv: 'ALTAN' },
    'room.UTEPLATS': { en: 'Patio', sv: 'UTEPLATS' },
    'room.TERRASS': { en: 'Terrace', sv: 'TERRASS' },
    'room.BALKONG': { en: 'Balcony', sv: 'BALKONG' },
    'room.GENERAL': { en: 'General / Unassigned', sv: 'Allmänt / Ej tilldelat' },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    translateRoom: (roomName: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('sv');

    useEffect(() => {
        const saved = localStorage.getItem('kgvilla-lang');
        if (saved === 'en' || saved === 'sv') {
            // eslint-disable-next-line
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('kgvilla-lang', lang);
    };

    const t = (key: string) => {
        const entry = dictionary[key];
        if (!entry) return key;
        return entry[language];
    };

    // Translate room names (handles numbered rooms like "SOV 1", "SOVRUM 2", etc.)
    const translateRoom = (roomName: string): string => {
        if (!roomName) return roomName;

        // If Swedish, return as-is
        if (language === 'sv') return roomName;

        // Try exact match first
        const exactKey = `room.${roomName}`;
        const exactEntry = dictionary[exactKey];
        if (exactEntry) return exactEntry[language];

        // Handle numbered rooms (e.g., "SOV 1" -> "Bedroom 1", "SOVRUM 2" -> "Bedroom 2")
        const numberedMatch = roomName.match(/^(.+?)\s*(\d+)$/);
        if (numberedMatch) {
            const baseName = numberedMatch[1].trim();
            const number = numberedMatch[2];
            const baseKey = `room.${baseName}`;
            const baseEntry = dictionary[baseKey];
            if (baseEntry) return `${baseEntry[language]} ${number}`;
        }

        // Handle rooms with WC/D prefix (e.g., "WC/D1" -> "Bathroom 1")
        const wcMatch = roomName.match(/^(WC\/D)(\d*)$/);
        if (wcMatch) {
            const number = wcMatch[2] || '';
            return number ? `Bathroom ${number}` : 'Bathroom';
        }

        // Return original if no translation found
        return roomName;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, translateRoom }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
}
