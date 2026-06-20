import sys
from google.adk.agents import Agent
from google.adk.tools.mcp_tool import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from mcp import StdioServerParameters

# Initialize the MCP toolset filtered for crop_knowledge
mcp_toolset = McpToolset(
    connection_params=StdioConnectionParams(
        server_params=StdioServerParameters(
            command=sys.executable,
            args=["-m", "backend.mcp_server.farmcare_mcp"]
        )
    ),
    tool_filter=["crop_knowledge"]
)

crop_agent = Agent(
    name="crop_agent",
    model="gemini-2.5-flash",
    instruction=(
        "You are the Crop Diagnosis Specialist Agent. Your primary role is to diagnose crop diseases and identify plant pests.\n"
        "1. Read the crop name, farming location, and description of symptoms.\n"
        "2. If an image is provided in the input, analyze it visually for diagnostic signs (spots, molds, colors, leaf curl).\n"
        "3. Invoke the `crop_knowledge` tool to query the expert knowledge database for biological diagnostics.\n"
        "4. Output a detailed diagnostic report listing the identified disease, symptoms, organic controls, and chemical controls."
    ),
    description="Analyzes plant symptoms and leaf images, queries biological databases, and diagnoses crop diseases.",
    tools=[mcp_toolset]
)
