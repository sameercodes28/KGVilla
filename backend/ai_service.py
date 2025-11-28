"""
AI Service Module
=================
"""
import os
import json
import logging
from typing import List, Dict
from models import CostItem, ChatResponse

# Configure Logging
logger = logging.getLogger(__name__)

# Environment Variables
PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "kgvilla")
LOCATION = "europe-north1"

# --- Defensive Import Strategy ---
try:
    import vertexai
    from vertexai.generative_models import GenerativeModel, Part, FinishReason
    _vertex_available = True
except ImportError as e:
    logger.warning(f"Vertex AI libraries not found: {e}")
    _vertex_available = False
except Exception as e:
    logger.warning(f"Error initializing Vertex AI context: {e}")
    _vertex_available = False

# Singleton Model Instance
_model = None

def get_model():
    global _model
    if not _vertex_available:
        raise ImportError("Vertex AI libraries are not available.")
        
    if _model is None:
        logger.info(f"Initializing Vertex AI for project {PROJECT_ID}...")
        vertexai.init(project=PROJECT_ID, location=LOCATION)
        _model = GenerativeModel("gemini-2.0-flash-001")
        logger.info("Vertex AI Model initialized successfully.")
    return _model

def load_standards_context() -> str:
    context = ""
    standards_dir = "./standards"
    
    if not os.path.exists(standards_dir):
        logger.warning(f"Standards directory {standards_dir} not found.")
        return "Standard Swedish Building Regulations (BBR 2025) apply."

    for filename in os.listdir(standards_dir):
        if filename.endswith(".md"):
            path = os.path.join(standards_dir, filename)
            try:
                with open(path, "r") as f:
                    context += f"\n\n--- STANDARD: {filename} ---\n{f.read()}"
            except Exception as e:
                logger.error(f"Error reading standard {filename}: {e}")
    
    return context

STANDARDS_CONTEXT = load_standards_context()

SYSTEM_INSTRUCTION = f"""
You are an expert Swedish Quantity Surveyor (Kalkylator).
Your task is to analyze architectural floor plans and generate a detailed Project Cost Breakdown.

You have access to the **SWEDISH_CONSTRUCTION_KNOWLEDGE_BASE** (attached below).
{STANDARDS_CONTEXT}

### OUTPUT FORMAT:
Return a JSON list of `CostItem` objects.
Each item MUST have a `breakdown` object.
"""

async def analyze_image_with_gemini(image_bytes: bytes, mime_type: str) -> Dict:
    if not _vertex_available:
        logger.error("Vertex AI unavailable")
        return {"items": [], "totalArea": 0}

    image_part = Part.from_data(data=image_bytes, mime_type=mime_type)

    prompt = """
    Analyze this floor plan carefully.

    STEP 1: Read any dimension labels visible in the image (e.g., "7800", "4590", "7350" in mm).
    STEP 2: Calculate the total living area (BOYTA/BOA) in square meters from the dimensions.
    STEP 3: Identify all rooms and their approximate areas.
    STEP 4: Generate cost estimates based on the actual calculated areas.

    Return a JSON object with this EXACT structure:
    {
        "totalArea": <number in m², e.g., 130.7>,
        "items": [<list of CostItem objects>]
    }

    IMPORTANT: The totalArea MUST be calculated from the floor plan dimensions, not estimated.
    """

    generation_config = {
        "max_output_tokens": 8192,
        "temperature": 0.2,
        "response_mime_type": "application/json"
    }

    try:
        model = get_model()
        responses = model.generate_content(
            [image_part, prompt, SYSTEM_INSTRUCTION],
            generation_config=generation_config,
            stream=False,
        )

        text_response = responses.text.strip()
        if text_response.startswith("```json"):
            text_response = text_response[7:]
        if text_response.endswith("```"):
            text_response = text_response[:-3]

        data = json.loads(text_response)

        # Handle different response formats
        if isinstance(data, dict):
            items = data.get("items", [])
            total_area = data.get("totalArea", 0)
            return {"items": items, "totalArea": total_area}
        elif isinstance(data, list):
            # Legacy format - just items
            return {"items": data, "totalArea": 0}
        else:
            return {"items": [], "totalArea": 0}

    except Exception as e:
        logger.error(f"Error calling Gemini: {e}")
        return {"items": [], "totalArea": 0}

async def generate_narrative_explanation(item: CostItem, context: Dict, language: str = "en") -> Dict:
    """
    Generate a detailed narrative explanation for a cost item.
    Returns flowing prose covering WHY, HOW, WHAT, and REGULATIONS.
    Supports both English (en) and Swedish (sv) languages.
    """
    if not _vertex_available:
        logger.error("Vertex AI unavailable for narrative generation")
        error_msg = "AI-tjänsten är inte tillgänglig. Kan inte generera detaljerad förklaring." if language == "sv" else "AI Service unavailable. Unable to generate detailed explanation."
        return {"narrative": error_msg}

    # Extract context data
    room = context.get("room", "Unknown room")
    dimensions = context.get("dimensions", "Not specified")
    boa = context.get("boa", 0)
    biarea = context.get("biarea", 0)

    # Extract the actual calculation method from the item (if available)
    calculation_method = ""
    if item.quantityBreakdown and item.quantityBreakdown.calculationMethod:
        calculation_method = item.quantityBreakdown.calculationMethod

    # Language-specific prompt sections
    if language == "sv":
        language_instruction = "SKRIV FÖRKLARINGEN PÅ SVENSKA med denna exakta struktur:"
        section_headers = {
            "calculation": "## Så räknade vi ut detta",
            "calculation_intro": "[1-2 meningar som förklarar mätningsmetoden]",
            "calculation_label": "**Beräkning:**",
            "materials_header": "## Vad som ingår i priset",
            "materials_label": "**Material:**",
            "labor_label": "**Arbetskostnad:**",
            "regulations_header": "## Tillämpliga regler",
            "compliance_note": "[1 mening om vikten av regelefterlevnad]"
        }
        format_instructions = """
FORMAT KRAV:
- Använd markdown-rubriker (##) för sektioner
- Använd punktlistor (- ) för listor
- Använd blockcitat (> ) för att markera regler - detta är VIKTIGT
- Använd **fetstil** för nyckeltermer
- Skriv helt på svenska
- Håll det kortfattat - cirka 250-350 ord totalt
- Gör det läsbart - någon ska kunna förstå huvudpunkterna på 10 sekunder
"""
    else:
        language_instruction = "WRITE AN EXPLANATION (IN ENGLISH) WITH THIS EXACT STRUCTURE:"
        section_headers = {
            "calculation": "## How We Calculated This",
            "calculation_intro": "[1-2 sentences explaining the measurement approach]",
            "calculation_label": "**Calculation:**",
            "materials_header": "## What's Included in the Price",
            "materials_label": "**Materials:**",
            "labor_label": "**Labor:**",
            "regulations_header": "## Applicable Regulations",
            "compliance_note": "[1 sentence about compliance importance]"
        }
        format_instructions = """
FORMAT REQUIREMENTS:
- Use markdown headers (##) for sections
- Use bullet points (- ) for lists
- Use blockquotes (> ) to highlight regulations - this is IMPORTANT
- Use **bold** for key terms
- Include Swedish terms with English in parentheses where helpful
- Keep it concise - approximately 250-350 words total
- Make it scannable - someone should grasp key points in 10 seconds
"""

    prompt = f"""
You are a Swedish construction expert writing a detailed explanation of a cost item
for a villa construction project. Write in a WELL-STRUCTURED format that is easy
to scan and understand.

Your audience is both professional builders and homeowner clients. The tone should
be authoritative yet accessible.

ITEM DATA:
- Element: {item.elementName}
- Description: {item.description}
- Quantity: {item.quantity} {item.unit}
- Unit Price: {item.unitPrice} kr/{item.unit}
- Total Cost: {item.totalCost} kr
- Phase: {item.phase}
- Room: {room}

CALCULATION METHOD (USE THIS EXACTLY):
{calculation_method if calculation_method else "Not specified - derive from quantity and context"}

CRITICAL INSTRUCTION: If a Calculation Method is provided above, you MUST use EXACTLY
that method in your explanation. Do NOT invent alternative measurement approaches like
"measuring eaves" or "counting from drawings". The calculation method shown above is
what was actually used by the pricing system.

FLOOR PLAN CONTEXT:
- Room this belongs to: {room}
- Room dimensions: {dimensions}
- Total BOA: {boa} m²
- Total Biarea: {biarea} m²

{language_instruction}

{section_headers['calculation']}
{section_headers['calculation_intro']}

{section_headers['calculation_label']}
- [Step 1 of calculation / Steg 1 i beräkningen]
- [Step 2 if applicable / Steg 2 om tillämpligt]
- Total: [final quantity with unit / slutlig kvantitet med enhet]

{section_headers['materials_header']}

{section_headers['materials_label']}
- [Material 1] - [purpose / syfte]
- [Material 2] - [purpose / syfte]
- [etc.]

{section_headers['labor_label']}
- [Description of work involved / Beskrivning av arbetet]
- [Any certifications required / Eventuella certifieringar som krävs]

{section_headers['regulations_header']}

> **[Regulation Code / Regelkod]** - [Brief description of requirement / Kort beskrivning av kravet]

> **[Another Regulation / En annan regel]** - [Brief description / Kort beskrivning]

{section_headers['compliance_note']}

---
{format_instructions}

Return a JSON object with this structure:
{{
    "narrative": "The full formatted markdown text here...",
    "keyRegulations": ["BBR 6:5", "Säker Vatten 2021:1", ...],
    "materials": ["Material 1", "Material 2", ...]
}}
"""

    generation_config = {
        "max_output_tokens": 4096,
        "temperature": 0.3,
        "response_mime_type": "application/json"
    }

    try:
        model = get_model()
        responses = model.generate_content(
            [prompt],
            generation_config=generation_config,
            stream=False,
        )

        text_response = responses.text.strip()
        if text_response.startswith("```json"):
            text_response = text_response[7:]
        if text_response.endswith("```"):
            text_response = text_response[:-3]

        result = json.loads(text_response)

        # Add language-specific disclaimer
        if language == "sv":
            disclaimer = (
                "\n\n---\n\n**Prisuppskattning:** "
                "Denna uppskattning baseras på svenska marknadspriser för 2025, "
                "sammanställda från branschkällor inklusive Wikells Sektionsfakta och SCB Byggkostnadsindex. "
                "JB Villan bör verifiera alla priser mot sina faktiska leverantörsofferter."
            )
        else:
            disclaimer = (
                "\n\n---\n\n**Price Estimate:** "
                "This estimate is based on Swedish market rates for 2025, compiled from "
                "industry sources including Wikells Sektionsfakta and SCB Byggkostnadsindex. "
                "JB Villan should verify all prices against their actual vendor quotes."
            )

        if "narrative" in result:
            result["narrative"] += disclaimer

        return result

    except Exception as e:
        logger.error(f"Narrative generation error: {e}")
        return {
            "narrative": f"Unable to generate detailed explanation. Error: {str(e)}",
            "keyRegulations": [],
            "materials": []
        }


async def chat_with_gemini(message: str, current_items: List[CostItem]) -> ChatResponse:
    if not _vertex_available:
        return ChatResponse(text="AI Service Unavailable.")

    items_context = "\n".join([f"- {item.elementName}: {item.totalCost} kr" for item in current_items])
    
    prompt = f"""
    USER QUESTION: "{message}"
    CURRENT COSTS:
    {items_context}

    TASK: Answer the user as a helpful Quantity Surveyor.
    
    OUTPUT FORMAT:
    You MUST return a SINGLE JSON object. Do not wrap in markdown code blocks.
    Structure:
    {{
        "text": "Your conversational response here...",
        "scenario": {{  // OPTIONAL: Only include if the user asks for a change/alternative.
            "title": "Short title (e.g., Switch to Heat Pump)",
            "description": "Explanation of the change and trade-offs.",
            "costDelta": -12000, // Negative for savings, Positive for extra cost
            "items": [ ... list of CostItem objects to add or replace ... ]
        }}
    }}
    """

    generation_config = {
        "max_output_tokens": 2048,
        "temperature": 0.4,
        "response_mime_type": "application/json"
    }

    try:
        model = get_model()
        responses = model.generate_content(
            [prompt, SYSTEM_INSTRUCTION],
            generation_config=generation_config,
            stream=False,
        )
        
        text_response = responses.text.strip()
        if text_response.startswith("```json"):
            text_response = text_response[7:]
        if text_response.endswith("```"):
            text_response = text_response[:-3]

        return ChatResponse(**json.loads(text_response))

    except Exception as e:
        logger.error(f"Chat error: {e}")
        return ChatResponse(text="Error processing request.")