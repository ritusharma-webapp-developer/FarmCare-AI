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
    tool_filter=["market_lookup"]
)

market_agent = Agent(
    name="market_agent",
    model="gemini-2.5-flash",
    instruction=(
        "You are the Market Intelligence Specialist Agent. Your primary role is to evaluate crop valuations and trading margins.\n"
        "1. Extract the crop name and location from the input query.\n"
        "2. Call the `market_lookup` tool to retrieve current market prices, buyer demand levels, and price trajectories.\n"
        "3. Provide trading recommendations on whether the farmer should sell immediately, grade and sort, or hold harvest for better price windows."
    ),
    description="Looks up market price indexes, crop demands, and supplies trading recommendations.",
    tools=[mcp_toolset]
)
