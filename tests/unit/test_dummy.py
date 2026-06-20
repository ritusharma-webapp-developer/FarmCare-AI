import pytest
from backend.firebase.firestore import (
    get_farmer,
    save_diagnosis,
    save_recommendation,
    get_diagnosis_history
)
from backend.mcp_server.farmcare_mcp import (
    crop_knowledge,
    weather_lookup,
    market_lookup,
    scheme_lookup
)

def test_mcp_crop_knowledge():
    """Verify MCP crop_knowledge tool functions correctly for known and unknown crops."""
    # Test valid crop lookup
    res = crop_knowledge("Tomato")
    assert res["status"] == "success"
    assert "optimal_parameters" in res
    assert "diseases" in res
    
    # Test fallback crop lookup
    res_fake = crop_knowledge("unknown_crop")
    assert res_fake["status"] == "partial_match"
    assert "general_advice" in res_fake

def test_mcp_weather_lookup():
    """Verify MCP weather_lookup retrieves forecast and temperature metrics."""
    res = weather_lookup("California, USA")
    assert res["status"] == "success"
    assert "temperature" in res
    assert "humidity" in res
    assert "alerts" in res

def test_mcp_market_lookup():
    """Verify MCP market_lookup retrieves pricing structures."""
    res = market_lookup("Tomato", "California, USA")
    assert res["status"] == "success"
    assert res["price_per_kg"] == 2.65
    assert res["demand"] == "High"

def test_mcp_scheme_lookup():
    """Verify MCP scheme_lookup retrieves subsidy lists."""
    res = scheme_lookup("Tomato", "California, USA")
    assert res["status"] == "success"
    assert len(res["schemes"]) >= 1

def test_firestore_mock_fallback_crud():
    """Verify standard CRUD simulation on firestore.py client fallback layer."""
    # Fetch demo farmer profile
    farmer = get_farmer("demo-farmer")
    assert farmer["name"] == "Demo Farmer"
    assert "Tomato" in farmer["crop_history"]
    
    # Save crop diagnosis session
    diag_id = save_diagnosis(
        farmer_id="demo-farmer",
        crop_name="Corn",
        location="California, USA",
        symptoms="Yellow lower leaves",
        image_url="/static/uploads/corn_test.jpg"
    )
    assert diag_id.startswith("diag_")
    
    # Save recommendation mapping
    rec_id = save_recommendation(
        diagnosis_id=diag_id,
        analysis_data={
            "crop_analysis": "Nitrogen shortage",
            "weather_analysis": "Mild showers ahead",
            "market_analysis": "Price indexing $0.45",
            "recommendation": "Add organic fertilizers"
        }
    )
    assert rec_id.startswith("rec_")
    
    # Fetch ledger logs
    history = get_diagnosis_history("demo-farmer")
    assert len(history) >= 1
    assert history[0]["crop_name"] == "Corn"
    assert "recommendation" in history[0]
    assert history[0]["recommendation"]["crop_analysis"] == "Nitrogen shortage"
