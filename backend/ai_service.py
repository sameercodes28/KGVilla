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
import logging
from typing import List, Dict, Optional
from models import CostItem, ChatResponse, Scenario

# Configure Logging
logger = logging.getLogger(__name__)

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
    logger.warning(f"Vertex AI libraries not found or failed to load: {e}")
    _vertex_available = False
except Exception as e:
    logger.warning(f"Error initializing Vertex AI context: {e}")
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

        

            logger.info(f"Initializing Vertex AI for project {PROJECT_ID}...")

        

            vertexai.init(project=PROJECT_ID, location=LOCATION)

        

            # We use 'gemini-1.5-flash' because it is:

        

            # 1. Fast (Low latency for the user)

        

            # 2. Cheap (Optimized for high-volume tasks)

        

            # 3. Multimodal (Can natively read PDF/Images)

        

            _model = GenerativeModel("gemini-1.5-flash-001")

        

            logger.info("Vertex AI Model initialized successfully.")

        

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

    

    

    

    # Load text once at startup (fast)

    

    STANDARDS_CONTEXT = load_standards_context()

    

    

    

    # --- The System Prompt ---

    

    

    

    # This is the "brain" of our surveyor. It defines the persona and the strict process.

    

    

    

    SYSTEM_INSTRUCTION = f"""

    

    

    

    You are an expert Swedish Quantity Surveyor (Kalkylator).

    

    

    

    Your goal is to produce a highly accurate "Bill of Quantities" and Cost Estimation from a 2D architectural floor plan.

    

    

    

    

    

    

    

    You have access to the **SWEDISH_CONSTRUCTION_KNOWLEDGE_BASE** (attached below), which contains "Assembly Recipes" and 2025 Unit Prices.

    

    

    

    

    

    

    

    {STANDARDS_CONTEXT}

    

    

    

    

    

    

    

    ### EXECUTION STRATEGY (Step-by-Step):

    

    

    

    

    

    

    

    1.  **SCALE CALIBRATION:**

    

    

    

        *   Look for dimension text (e.g., "13.5" inside a room = 13.5 m²).

    

    

    

        *   Look for a standard door. Assume standard interior door width is 0.9m (900mm). Use this to establish pixel-to-meter scale.

    

    

    

    

    

    

    

    2.  **ROOM SEGMENTATION:**

    

    

    

        *   Identify every room. Classify them: 'Wet' (Bad/Tvätt), 'Living' (Vardagsrum/Sov), 'Technical' (Teknik), 'Kitchen' (Kök).

    

    

    

        *   Calculate **Floor Area (m²)** and **Wall Perimeter (m)** for each.

    

    

    

    

    

    

    

    3.  **COMPONENT INFERENCE (The "Invisible" Layer):**

    

    

    

        *   *Crucial Step:* Architectural plans do not show pipes/wires. You must INFER them.

    

    

    

        *   **If Bathroom:** Add Waterproofing Assembly (Zone 1), Floor Drain (Golvbrunn), Spotlights (1 per 1.5m²).

    

    

    

        *   **If Kitchen:** Add Leakage Trays (Läckageskydd), Heavy Power Feeds (Stove/Oven).

    

    

    

        *   **If Technical Room:** Add Heat Pump (Värmepump) and Fuse Box (Elcentral) if this looks like a main house.

    

    

    

    

    

    

    

    4.  **QUANTITY & PRICING:**

    

    

    

        *   **Internal Walls:** Calculate total internal wall length. Multiply by 2.5m height. Multiply by **Unit Price** from Section 1.

    

    

    

        *   **Flooring:** Room Area + 10% Waste.

    

    

    

        *   **Client Costs:** Always include the "Soft Costs" (Connection fees, permits) defined in Section 4.

    

    

    

    

    

    

    

    ### OUTPUT FORMAT:

    

    

    

    

    

    

    

    Return a JSON list of `CostItem` objects.

    

    

    

    

    

    

    

    Each item MUST have a `calculationLogic` field. This field is shown to the user to explain the cost.

    

    

    

    

    

    

    

    **CRITICAL:** In `calculationLogic`, explicitly mention the assumption or standard used.

    

    

    

    

    

    

    

    *   *Good:* "Area 15m² x 850kr. Includes 10% waste. Priced using ABT 06 Risk Premium (+12%)."

    

    

    

    

    

    

    

    *   *Good:* "Mandatory addition per Säker Vatten: Leakage trays for kitchen appliances."

    

    

    

    

    

    

    

    *   *Bad:* "Calculated based on area."

    

    

    

    

    

    

    

    """

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    async def analyze_image_with_gemini(image_bytes: bytes, mime_type: str) -> List[Dict]:

    """

    The main function to process a file.

    

    Args:

        image_bytes: The raw binary data of the file.

        mime_type: The file type (e.g., 'application/pdf', 'image/jpeg').

        

    Returns:

        A list of dictionaries representing the Cost Items.

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

        

    

        

    async def chat_with_gemini(message: str, current_items: List[CostItem]) -> ChatResponse:

        

        """

        

        Handles conversational queries about the project.

        

        Can propose 'Scenarios' (modifications to the cost list).

        

        """

        

        if not _vertex_available:

        

            return ChatResponse(text="AI Service Unavailable (Vertex AI libraries missing).")

        

    

        

        # Format current items for context

        

        items_context = "\n".join([f"- {item.elementName}: {item.quantity} {item.unit} @ {item.unitPrice} kr = {item.totalCost} kr" for item in current_items])

        

        

        

        prompt = f"""

        

        USER QUESTION: "{message}"

        

    

        

        CURRENT PROJECT COST ITEMS:

        

        {items_context}

        

    

        

        TASK:

        

        1. Answer the user's question based on the Swedish Construction Knowledge Base (attached below).

        

        2. If the user suggests a change (e.g. "remove fireplace", "change flooring to pine"), propose a SCENARIO.

        

        

        

        OUTPUT FORMAT (JSON):

        

        {{

        

            "text": "Your conversational answer...",

        

            "scenario": {{

        

                "title": "Short Title of Change",

        

                "description": "What changes and why.",

        

                "costDelta": -50000,  // Negative for savings, Positive for cost increase

        

                "items": [ ... list of NEW or REPLACEMENT CostItems ... ]

        

            }} 

        

        }}

        

        *Only include 'scenario' if a change is logical.*

        

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

        

                

        

            data = json.loads(text_response)

        

            return ChatResponse(**data)

        

    

        

        except Exception as e:

        

            print(f"Error in chat: {e}")

        

            return ChatResponse(text="I encountered an error processing your request.")

        

    
