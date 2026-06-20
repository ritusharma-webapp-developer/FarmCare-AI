from google.adk.agents import Agent
from google.adk.apps import App, ResumabilityConfig
from backend.agents.crop_agent import crop_agent
from backend.agents.weather_agent import weather_agent
from backend.agents.market_agent import market_agent
from backend.agents.scheme_agent import scheme_agent
from backend.agents.recommendation_agent import recommendation_agent

root_agent = Agent(
    name="root_agent",
    model="gemini-2.5-flash",
    instruction=(
        "You are the Root Coordinator Agent of the FarmCare AI Multi-Agent Agricultural Intelligence System.\n"
        "Your objective is to help farmers diagnose crop diseases, check weather impacts, find market rates, and review subsidies.\n"
        "To perform a comprehensive crop diagnostics checkup, you MUST delegate tasks to your specialist sub-agents:\n"
        "- Transfer control to crop_agent to diagnose leaf issues from plant symptoms or visual images.\n"
        "- Transfer control to weather_agent to fetch local forecasts and environmental risk factors.\n"
        "- Transfer control to market_agent to check price indexes and lock-in windows.\n"
        "- Transfer control to scheme_agent to check relevant subsidies and state programs.\n"
        "After collecting analysis from these specialists, transfer control to recommendation_agent to synthesize the final plan.\n"
        "When answering general questions, respond directly in a polite, professional agricultural consultant tone."
    ),
    sub_agents=[crop_agent, weather_agent, market_agent, scheme_agent, recommendation_agent]
)

# Define the ADK App instance, ensuring name matches the module root "backend"
app = App(
    root_agent=root_agent,
    name="backend",
    resumability_config=ResumabilityConfig(is_resumable=True)
)
