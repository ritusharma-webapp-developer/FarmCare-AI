from pydantic import BaseModel, Field
from google.adk.agents import Agent

class FarmCareAnalysis(BaseModel):
    crop_analysis: str = Field(
        description="Detailed plant diagnostics, suspected diseases, confidence level, organic/chemical treatment, and botanical prevention tips."
    )
    weather_analysis: str = Field(
        description="5-day local weather summary, humidity/temperature agricultural impacts, watering schedule alerts, and crop survival advice."
    )
    market_analysis: str = Field(
        description="Current market price valuation, buyer demand intensity, price trends (rising/falling), and commercial selling/harvesting advice."
    )
    recommendation: str = Field(
        description="Actionable farming recommendation, step-by-step treatment plan, and relevant government subsidies or crop insurance details."
    )

recommendation_agent = Agent(
    name="recommendation_agent",
    model="gemini-2.5-flash",
    instruction=(
        "You are the agricultural synthesis agent. Your job is to take the reports from "
        "the Crop Agent, Weather Agent, Market Agent, and Government Scheme Agent, and compile "
        "them into a unified actionable roadmap for the farmer. "
        "Strictly adhere to the output schema. Ensure all fields are filled with comprehensive details."
    ),
    output_schema=FarmCareAnalysis,
    output_key="recommendation_result"
)
