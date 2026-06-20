import sys
from google.adk.agents import Agent
from google.adk.tools.mcp_tool import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from mcp import StdioServerParameters

mcp_toolset = McpToolset(
    connection_params=StdioConnectionParams(
        server_params=StdioServerParameters(
            command=sys.executable,
            args=["-m", "backend.mcp_server.farmcare_mcp"]
        )
    ),
    tool_filter=["weather_lookup"]
)

weather_agent = Agent(
    name="weather_agent",
    model="gemini-2.5-flash",
    instruction=(
        "You are the Weather Specialist Agent. Your primary role is to evaluate environmental conditions and weather hazards.\n"
        "1. Extract the farmer's location from the input query.\n"
        "2. Call the `weather_lookup` tool to retrieve the 5-day forecast, temperature, humidity, and rainfall indicators.\n"
        "3. Evaluate the risk of plant diseases based on weather (e.g. high humidity triggers blight or mildews).\n"
        "4. Summarize the temperature and watering alerts, outlining the specific agricultural impact for the farmer."
    ),
    description="Queries local weather reports and evaluates weather-related crop disease risks.",
    tools=[mcp_toolset]
)
