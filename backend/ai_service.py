import os
import json
from typing import List, Dict
from models import BoQItem

# Try to import Vertex AI, but don't crash if it fails (e.g., missing credentials during build)
try:
    import vertexai
    from vertexai.generative_models import GenerativeModel, Part, FinishReason
    _vertex_available = True
except ImportError as e:
    print(f"WARNING: Vertex AI libraries not found or failed to load: {e}")
    _vertex_available = False
except Exception as e:
    print(f"WARNING: Error initializing Vertex AI context: {e}")
    _vertex_available = False

# Initialize Vertex AI (Environment variables handled by Cloud Run)
PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "kgvilla")
LOCATION = "europe-north1"

_model = None

def get_model():
    global _model
    if not _vertex_available:
        raise ImportError("Vertex AI libraries are not available in this environment.")
        
    if _model is None:
        print(f"Initializing Vertex AI for project {PROJECT_ID}...")
        vertexai.init(project=PROJECT_ID, location=LOCATION)
        _model = GenerativeModel("gemini-1.5-flash-001")
        print("Vertex AI Model initialized successfully.")
    return _model

def load_standards_context() -> str:
    """
    Reads the Swedish Building Standards from the local directory.
    """
    context = ""
    standards_dir = "./standards"
    
    if not os.path.exists(standards_dir):
        print(f"Warning: Standards directory {standards_dir} not found.")
        return "Standard Swedish Building Regulations (BBR 2025) apply."

    for filename in os.listdir(standards_dir):
        if filename.endswith(".md"):
            path = os.path.join(standards_dir, filename)
            try:
                with open(path, "r") as f:
                    context += f"\n\n--- STANDARD: {filename} ---\n{f.read()}"
            except Exception as e:
                print(f"Error reading standard {filename}: {e}")
    
    return context

# Load text once at startup (fast)
STANDARDS_CONTEXT = load_standards_context()

SYSTEM_INSTRUCTION = f"""
You are an expert Swedish Quantity Surveyor (Kalkylator) and Building Code Compliance Officer.
Your task is to analyze architectural floor plans and generate a detailed Bill of Quantities (BoQ).

You must strictly adhere to the following Swedish Standards:
{STANDARDS_CONTEXT}

### ANALYSIS PROCESS (Chain of Thought):
1.  **VISUAL SCAN:** Identify the scale bar. If none, estimate based on standard door width (0.9m - 1.0m). Identify all rooms.
2.  **COMPONENT EXTRACTION:** Count windows, doors, sockets, sinks, etc.
3.  **COMPLIANCE CHECK:**
    *   Cross-reference every room with BBR and Säker Vatten rules.
    *   Example: If you see a 'KÖK' (Kitchen), check for a dishwasher. If present, you MUST add a 'Läckageskydd' (Leakage Tray) cost item.
    *   Example: If a bathroom is < 1.7m wide, flag it as 'Non-Compliant (Accessibility)'.
4.  **CALCULATION:**
    *   Wall Area = (Perimeter * 2.4m) - Window/Door Areas.
    *   Floor Area = Room Width * Room Length.
    *   Electrical: Estimate cable runs using Manhattan Distance (Not diagonal).

### OUTPUT FORMAT:
Return purely JSON data matching the BoQItem schema. No markdown formatting.
"""

async def analyze_image_with_gemini(image_bytes: bytes, mime_type: str) -> List[Dict]:
    """
    Sends the image to Gemini 1.5 Pro for analysis.
    """
    if not _vertex_available:
        print("Error: Vertex AI is not available.")
        return []

    image_part = Part.from_data(data=image_bytes, mime_type=mime_type)
    
    prompt = """
    Analyze this floor plan. 
    1. List all rooms found.
    2. For each room, calculate the cost items (Materials & Labor).
    3. Identify any 'Client Costs' (Byggherrekostnader) implied (e.g., if it's a new build, add 'Nybyggnadskarta').
    
    Return a JSON list of objects with these fields:
    - projectId: "detected-from-plan"
    - phase: "ground" | "structure" | "electrical" | "plumbing" | "interior"
    - elementName: string (Swedish)
    - description: string (English explanation of the calculation)
    - quantity: number
    - unit: "m2" | "st" | "m"
    - unitPrice: number (Estimate in SEK based on 2024 prices)
    - totalCost: number
    - confidenceScore: number (0.0 - 1.0)
    - calculationLogic: string (Explain HOW you derived this quantity/price and which Standard applied)
    """

    generation_config = {
        "max_output_tokens": 8192,
        "temperature": 0.2,
        "top_p": 0.95,
        "response_mime_type": "application/json"
    }

    try:
        model = get_model()
        responses = model.generate_content(
            [image_part, prompt, SYSTEM_INSTRUCTION],
            generation_config=generation_config,
            stream=False,
        )

        # Clean up potential markdown blocks if Gemini ignores mime_type enforcement
        text_response = responses.text.strip()
        if text_response.startswith("```json"):
            text_response = text_response[7:]
        if text_response.endswith("```"):
            text_response = text_response[:-3]
            
        data = json.loads(text_response)
        
        # Ensure it's a list
        if isinstance(data, dict) and "items" in data:
            return data["items"]
        return data if isinstance(data, list) else []
        
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return []
