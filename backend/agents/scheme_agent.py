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
    tool_filter=["scheme_lookup"]
)

scheme_agent = Agent(
    name="scheme_agent",
    model="gemini-2.5-flash",
    instruction=(
        "You are the Government Scheme Specialist Agent. Your primary role is to identify state/federal agricultural aid and subsidies.\n"
        "1. Extract the crop name and location from the input query.\n"
        "2. Call the `scheme_lookup` tool to retrieve active government subsidies, crop insurance programs, and conservation funding.\n"
        "3. Detail the key benefits and enrollment criteria to make it simple for the farmer to apply."
    ),
    description="Looks up applicable government farming schemes, agricultural subsidies, and crop insurance policies.",
    tools=[mcp_toolset]
)
