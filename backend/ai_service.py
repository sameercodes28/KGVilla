"""
AI Service Module
=================

This module handles all interactions with Google Vertex AI (Gemini).

Key Features:
1.  **Defensive Loading:** It allows the server to start even if AI credentials are missing (useful for local dev/builds).
2.  **Context Injection:** It loads Swedish Building Standards (BBR) into the prompt context.
3.  **Chain of Thought:** It forces the AI to "show its work" before calculating costs, improving accuracy.
"""

import os
import json
from typing import List, Dict
from models import BoQItem

# --- Defensive Import Strategy ---
# The Vertex AI libraries require Google Cloud credentials to load.
# During the Docker build process or local testing, these credentials might be missing.
# We wrap imports in a try-except block so the server doesn't crash immediately on startup.
# This allows the "Health Check" endpoint to pass even if AI isn't configured yet.
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

# Environment Variables
# These are injected by Cloud Run automatically.
PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "kgvilla")
LOCATION = "europe-north1"  # Keeping data in EU/Finland for lower latency and GDPR compliance.

# Singleton Model Instance
_model = None

def get_model():
    """
    Lazy-loads the Gemini Model. 
    
    Why?
    Initializing Vertex AI takes time and network calls. We don't want to slow down
    the server startup time (Cold Start). Instead, we connect to Google's AI servers
    only when the first user actually asks for an analysis.
    """
    global _model
    if not _vertex_available:
        raise ImportError("Vertex AI libraries are not available in this environment.")
        
    if _model is None:
        print(f"Initializing Vertex AI for project {PROJECT_ID}...")
        vertexai.init(project=PROJECT_ID, location=LOCATION)
        # We use 'gemini-1.5-flash' because it is:
        # 1. Fast (Low latency for the user)
        # 2. Cheap (Optimized for high-volume tasks)
        # 3. Multimodal (Can natively read PDF/Images)
        _model = GenerativeModel("gemini-1.5-flash-001")
        print("Vertex AI Model initialized successfully.")
    return _model

def load_standards_context() -> str:
    """
    Reads Swedish Building Standards from the local filesystem. 
    
    These markdown files contain the "Knowledge Base" for the AI.
    By injecting them into the prompt, we ensure the AI follows *our* specific rules
    (like BBR 2025) rather than generic internet knowledge.
    """
    context = ""
    standards_dir = "./standards"
    
    if not os.path.exists(standards_dir):
        print(f"Warning: Standards directory {standards_dir} not found.")
        return "Standard Swedish Building Regulations (BBR 2025) apply."

    # Iterate through all markdown files in the directory
    for filename in os.listdir(standards_dir):
        if filename.endswith(".md"):
            path = os.path.join(standards_dir, filename)
            try:
                with open(path, "r") as f:
                    context += f"\n\n--- STANDARD: {filename} ---\n{f.read()}"
            except Exception as e:
                print(f"Error reading standard {filename}: {e}")
    
    return context

# Load the text into memory once at startup.
# This string is ~5-10k tokens and will be prepended to every AI request.
STANDARDS_CONTEXT = load_standards_context()

# --- The System Prompt ---
# This is the "brain" of our surveyor. It defines the persona and the strict process.
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
    The main function to process a file. 
    
    Args:
        image_bytes: The raw binary data of the file.
        mime_type: The file type (e.g., 'application/pdf', 'image/jpeg').
        
    Returns:
        A list of dictionaries representing the Bill of Quantities items.
    """
    if not _vertex_available:
        print("Error: Vertex AI is not available.")
        return []

    # Convert raw bytes to a format Vertex AI understands
    image_part = Part.from_data(data=image_bytes, mime_type=mime_type)
    
    # The specific prompt for this request
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

    # Configuration for the AI generation
    generation_config = {
        "max_output_tokens": 8192,  # Allow for long, detailed responses
        "temperature": 0.2,         # Low temperature = More factual/deterministic, less creative
        "top_p": 0.95,
        "response_mime_type": "application/json" # Force Gemini to return valid JSON
    }

    try:
        # Get the lazy-loaded model
        model = get_model()
        
        # Send the request to Google's servers
        responses = model.generate_content(
            [image_part, prompt, SYSTEM_INSTRUCTION],
            generation_config=generation_config,
            stream=False,
        )

        # --- Response Parsing ---
        # Sometimes Gemini wraps JSON in ```json markdown blocks. We need to strip them.
        text_response = responses.text.strip()
        if text_response.startswith("```json"):
            text_response = text_response[7:]
        if text_response.endswith("```"):
            text_response = text_response[:-3]
            
        data = json.loads(text_response)
        
        # Normalize the output (ensure it's always a list of items)
        if isinstance(data, dict) and "items" in data:
            return data["items"]
        return data if isinstance(data, list) else []
        
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return []