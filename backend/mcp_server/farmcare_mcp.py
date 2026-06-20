import logging
from typing import Optional, Dict, Any
from mcp.server.fastmcp import FastMCP

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("farmcare_mcp")

# Initialize FastMCP Server
mcp = FastMCP("FarmCare AI MCP Server")

# =============================================================================
# Localized Offline Knowledge Databases for Robust Demo Performance
# =============================================================================

CROP_DATABASE = {
    "tomato": {
        "diseases": {
            "late_blight": {
                "name": "Late Blight (Phytophthora infestans)",
                "symptoms": "Dark water-soaked spots on leaves, white fungal growth on undersides in humid conditions, large brown lesions on fruit.",
                "organic_treatment": "Apply copper-based fungicides or bio-fungicides containing Bacillus subtilis. Remove and destroy infected foliage.",
                "chemical_treatment": "Apply Chlorothalonil or Mancozeb protective sprays.",
                "prevention": "Avoid overhead watering, use drip irrigation, space plants for airflow, practice crop rotation, choose resistant varieties."
            },
            "early_blight": {
                "name": "Early Blight (Alternaria solani)",
                "symptoms": "Concentric rings (target pattern) on older leaves, yellow halo surrounding dark brown spots, stem lesions near ground level.",
                "organic_treatment": "Use copper soap or neem oil spray. Prune lower leaves to prevent soil splash.",
                "chemical_treatment": "Apply Chlorothalonil or Azoxystrobin.",
                "prevention": "Mulch soil around plants, sanitize tools between prunings, rotate Solanaceous crops yearly."
            },
            "leaf_mold": {
                "name": "Leaf Mold (Passalora fulva)",
                "symptoms": "Pale green or yellow spots on upper leaf surfaces, olive-green velvet-like mold underneath, leaves curl and drop.",
                "organic_treatment": "Improve greenhouse ventilation, reduce relative humidity below 70%, apply sulfur dusts.",
                "chemical_treatment": "Use Difenoconazole or Mancozeb sprays.",
                "prevention": "Ensure high spacing, select resistant cultivars, clean greenhouse structures thoroughly."
            }
        },
        "general": {
            "optimal_temp": "21°C - 29°C",
            "optimal_ph": "6.0 - 6.8",
            "watering": "Deep watering 1-2 inches per week, keeping soil evenly moist."
        }
    },
    "corn": {
        "diseases": {
            "rust": {
                "name": "Common Rust (Puccinia sorghi)",
                "symptoms": "Golden-brown to cinnamon-brown pustules on both leaf surfaces, leaf yellowing under heavy infection.",
                "organic_treatment": "Apply sulfur powder or copper soap. Avoid crowding crops.",
                "chemical_treatment": "Use Strobilurin or Triazole group fungicides.",
                "prevention": "Use resistant hybrids, plant early to escape late-season spore loads."
            },
            "maize_dwarf": {
                "name": "Maize Dwarf Mosaic Virus",
                "symptoms": "Mottled yellow-green streaks on youngest leaves, dwarfed growth, poor ear development.",
                "organic_treatment": "No cure. Rogue infected plants. Spray neem oil to manage aphid vectors.",
                "chemical_treatment": "Fungicides are ineffective. Treat with imidacloprid to suppress aphid vectors.",
                "prevention": "Eradicate Johnsongrass (primary virus host) near fields, plant resistant cultivars."
            }
        },
        "general": {
            "optimal_temp": "18°C - 30°C",
            "optimal_ph": "5.8 - 7.0",
            "watering": "1 inch of water weekly, especially critical during silking phase."
        }
    },
    "wheat": {
        "diseases": {
            "leaf_rust": {
                "name": "Leaf Rust (Puccinia recondita)",
                "symptoms": "Small orange-red oval pustules scattered randomly on leaves, early leaf senescence, shriveled kernels.",
                "organic_treatment": "Dust with sulfur. Plant diverse cultivar mixes.",
                "chemical_treatment": "Apply Tebuconazole or Propiconazole at flag leaf emergence.",
                "prevention": "Eradicate volunteer wheat plants before sowing, use rust-resistant cultivars."
            }
        },
        "general": {
            "optimal_temp": "12°C - 25°C",
            "optimal_ph": "6.0 - 7.5",
            "watering": "Maintain good moisture levels until grain filling, ~15 inches total per season."
        }
    }
}

MARKET_DATABASE = {
    "tomato": {
        "California, USA": {"price_per_kg": 2.65, "demand": "High", "trend": "Upward", "advice": "Supply is low due to recent rains; prices are expected to rise. Hold fresh harvest for 3 days or sell in premium farmer markets."},
        "Texas, USA": {"price_per_kg": 2.10, "demand": "Medium", "trend": "Stable", "advice": "Market is balanced. Recommended to sell immediately to wholesale distributors to avoid post-harvest losses."},
        "default": {"price_per_kg": 1.95, "demand": "Medium", "trend": "Stable", "advice": "Steady supply. Grade and pack tomatoes well to command better pricing."}
    },
    "corn": {
        "California, USA": {"price_per_kg": 0.45, "demand": "Medium", "trend": "Stable", "advice": "Feed mills are buying steadily. Lock in contract rates now."},
        "Iowa, USA": {"price_per_kg": 0.38, "demand": "High", "trend": "Downward", "advice": "Harvest peak has caused market glut. Consider silage conversion or storage in grain elevators if holding capacity exists."},
        "default": {"price_per_kg": 0.35, "demand": "Medium", "trend": "Stable", "advice": "Normal trade volumes. Ensure moisture contents are below 15% before selling."}
    },
    "default": {
        "default": {"price_per_kg": 1.20, "demand": "Medium", "trend": "Stable", "advice": "General market trends apply. Check local mandis/distributors."}
    }
}

WEATHER_DATABASE = {
    "California, USA": {"temp": "26°C", "humidity": "85%", "rain": "High (Light showers expected)", "alerts": "Humidity is high (85%). Favorable conditions for Late Blight on Solanaceous crops. Restrict overhead sprinkler irrigation."},
    "Texas, USA": {"temp": "32°C", "humidity": "45%", "rain": "None (Dry spelling)", "alerts": "Drought stress risk. Adjust drip watering systems and ensure early morning irrigation."},
    "Iowa, USA": {"temp": "22°C", "humidity": "60%", "rain": "Medium", "alerts": "Stable conditions. Ideal for standard weeding operations."}
}

SCHEME_DATABASE = {
    "tomato": {
        "California, USA": [
            {"name": "CDFA Organic Transition Subsidy", "benefit": "Reimbursement of up to 50% ($1000 max) of certification expenses.", "eligibility": "Farmers transition land to organic methods."},
            {"name": "USDA Specialty Crop Block Grant", "benefit": "Subsidized water efficiency equipment (drip irrigation installation).", "eligibility": "Active commercial specialty crop growers."}
        ],
        "default": [
            {"name": "Federal Crop Insurance Program", "benefit": "Protects against yield losses due to extreme weather.", "eligibility": "All registered agricultural operations."}
        ]
    },
    "corn": {
        "Iowa, USA": [
            {"name": "Cover Crop Conservation Initiative", "benefit": "$25 per acre incentive for planting cover crops post-harvest.", "eligibility": "Iowa corn/soybean rotation growers."},
            {"name": "USDA EQIP Water Quality Subsidy", "benefit": "Funding for nitrogen management soil testing.", "eligibility": "Compliance with conservation standards."}
        ],
        "default": [
            {"name": "USDA Price Loss Coverage (PLC)", "benefit": "Financial assistance when market prices fall below reference benchmark.", "eligibility": "Farms with established base acres."}
        ]
    },
    "default": {
        "default": [
            {"name": "National Agricultural Insurance Scheme", "benefit": "Comprehensive yield protection coverage.", "eligibility": "Active landholding farmers."}
        ]
    }
}

# =============================================================================
# MCP Tools Implementation
# =============================================================================

@mcp.tool()
def crop_knowledge(crop_name: str, disease_query: Optional[str] = None) -> Dict[str, Any]:
    """Look up biological details, optimal parameters, and diseases for a crop.
    
    Args:
        crop_name: The name of the crop (e.g. Tomato, Corn, Wheat).
        disease_query: Optional specific disease name or symptom query.
    """
    logger.info(f"crop_knowledge called for crop: {crop_name}, disease: {disease_query}")
    
    if not crop_name or not isinstance(crop_name, str):
        raise ValueError("Invalid crop name provided. Must be a non-empty string.")
        
    normalized_crop = crop_name.strip().lower()
    
    # Check if crop exists in knowledge base
    if normalized_crop not in CROP_DATABASE:
        return {
            "status": "partial_match",
            "crop": crop_name,
            "message": f"Crop '{crop_name}' is not in the primary offline database. Providing general agricultural diagnostic advice.",
            "general_advice": "Check leaves for mottling, yellowing, or spots. Maintain proper spacing, soil pH of 6.2-6.8, and avoid waterlogging. Use neem oil or copper soap as general broad-spectrum remedies."
        }
        
    crop_info = CROP_DATABASE[normalized_crop]
    
    # If specific disease query is provided, look for it
    if disease_query:
        norm_query = disease_query.strip().lower().replace(" ", "_")
        diseases = crop_info.get("diseases", {})
        
        # Exact match check
        if norm_query in diseases:
            return {
                "status": "success",
                "crop": crop_name,
                "disease_details": diseases[norm_query],
                "optimal_parameters": crop_info.get("general")
            }
            
        # Keyword search check
        for dis_key, dis_val in diseases.items():
            if norm_query in dis_key or norm_query in dis_val["name"].lower() or norm_query in dis_val["symptoms"].lower():
                return {
                    "status": "success",
                    "crop": crop_name,
                    "disease_details": dis_val,
                    "optimal_parameters": crop_info.get("general"),
                    "note": f"Found fuzzy match for disease query '{disease_query}'"
                }
                
    # Return all diseases and general details for the crop
    return {
        "status": "success",
        "crop": crop_name,
        "diseases": crop_info.get("diseases", {}),
        "optimal_parameters": crop_info.get("general")
    }

@mcp.tool()
def market_lookup(crop_name: str, location: str) -> Dict[str, Any]:
    """Retrieves current market prices, demand levels, price trends, and trading advice.
    
    Args:
        crop_name: The name of the crop (e.g. Tomato, Corn, Wheat).
        location: The farming/sale region (e.g. California, USA).
    """
    logger.info(f"market_lookup called for crop: {crop_name}, location: {location}")
    
    if not crop_name or not location:
        raise ValueError("Both crop_name and location must be specified.")
        
    normalized_crop = crop_name.strip().lower()
    loc = location.strip()
    
    # Fetch crop market entries
    crop_market = MARKET_DATABASE.get(normalized_crop, MARKET_DATABASE.get("default"))
    
    # Try specific location, fallback to default
    market_info = crop_market.get(loc, crop_market.get("default", MARKET_DATABASE["default"]["default"]))
    
    return {
        "status": "success",
        "crop": crop_name,
        "location": location,
        "price_per_kg": market_info["price_per_kg"],
        "demand": market_info["demand"],
        "trend": market_info["trend"],
        "trading_advice": market_info["advice"]
    }

@mcp.tool()
def weather_lookup(location: str) -> Dict[str, Any]:
    """Retrieves 5-day weather conditions, humidity levels, rain risk, and specific farming alerts.
    
    Args:
        location: The farming region (e.g. California, USA).
    """
    logger.info(f"weather_lookup called for location: {location}")
    
    if not location:
        raise ValueError("Location must be specified.")
        
    loc = location.strip()
    
    # Resolve weather, default to general mild parameters
    weather_info = WEATHER_DATABASE.get(loc, {
        "temp": "24°C",
        "humidity": "55%",
        "rain": "Low (Clear skies)",
        "alerts": "No severe agricultural weather alerts. Standard irrigation scheduling recommended."
    })
    
    return {
        "status": "success",
        "location": location,
        "temperature": weather_info["temp"],
        "humidity": weather_info["humidity"],
        "rain_level": weather_info["rain"],
        "alerts": weather_info["alerts"],
        "forecast": [
            {"day": "Day 1", "temp": weather_info["temp"], "humidity": weather_info["humidity"], "condition": "Cloudy" if "80%" in weather_info["humidity"] else "Sunny"},
            {"day": "Day 2", "temp": "25°C", "humidity": "60%", "condition": "Sunny"},
            {"day": "Day 3", "temp": "24°C", "humidity": "55%", "condition": "Sunny"},
            {"day": "Day 4", "temp": "23°C", "humidity": "58%", "condition": "Sunny"},
            {"day": "Day 5", "temp": "24°C", "humidity": "50%", "condition": "Clear"}
        ]
    }

@mcp.tool()
def scheme_lookup(crop_name: str, location: str) -> Dict[str, Any]:
    """Looks up government schemes, organic subsidies, and crop insurance options.
    
    Args:
        crop_name: The name of the crop.
        location: The region of the farm.
    """
    logger.info(f"scheme_lookup called for crop: {crop_name}, location: {location}")
    
    if not crop_name or not location:
        raise ValueError("Both crop_name and location must be specified.")
        
    normalized_crop = crop_name.strip().lower()
    loc = location.strip()
    
    # Try crop-specific schemes, fallback to default
    crop_schemes = SCHEME_DATABASE.get(normalized_crop, SCHEME_DATABASE.get("default"))
    
    # Try location schemes, fallback to default
    schemes_list = crop_schemes.get(loc, crop_schemes.get("default", SCHEME_DATABASE["default"]["default"]))
    
    return {
        "status": "success",
        "crop": crop_name,
        "location": location,
        "schemes": schemes_list
    }

# Command run entrypoint
if __name__ == "__main__":
    mcp.run()
