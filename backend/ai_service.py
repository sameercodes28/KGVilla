"""
AI Service Module
=================
"""
import os
import json
import logging
from typing import List, Dict, Optional
from models import CostItem, ChatResponse, Scenario

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
        _model = GenerativeModel("gemini-1.5-flash-001")
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

async def analyze_image_with_gemini(image_bytes: bytes, mime_type: str) -> List[Dict]:
    if not _vertex_available:
        logger.error("Vertex AI unavailable")
        return []

    image_part = Part.from_data(data=image_bytes, mime_type=mime_type)
    
    prompt = """
    Analyze this floor plan. Identify rooms, calculate areas (BOA/BYA), and estimate costs using the 2025 Knowledge Base.
    Return a JSON list of CostItems.
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
        if isinstance(data, dict) and "items" in data:
            return data["items"]
        return data if isinstance(data, list) else []
        
    except Exception as e:
        logger.error(f"Error calling Gemini: {e}")
        return []

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