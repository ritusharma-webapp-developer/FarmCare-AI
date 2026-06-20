import pytest
from google.adk.runners import InMemoryRunner
from google.adk.events.event import Event
from google.genai import types

from backend.agents.root_agent import app, root_agent

@pytest.mark.asyncio
async def test_agent_local_runner(monkeypatch) -> None:
    """
    Test the root coordinator agent's basic local runner execution with mock model calls.
    """
    runner = InMemoryRunner(app=app)
    
    # Mock run_async to yield a simulated agent event offline
    async def mock_run_async(*args, **kwargs):
        yield Event(
            author="root_agent",
            content=types.Content(
                role="model",
                parts=[types.Part(text="This is a mock agricultural advisor response.")]
            )
        )

    monkeypatch.setattr(runner, "run_async", mock_run_async)
    
    # Create session
    session = await runner.session_service.create_session(
        app_name="backend",
        user_id="test_user",
        session_id="test-session-123"
    )
    
    # Send user hello message
    new_message = types.Content(
        role="user",
        parts=[types.Part(text="Hello, how can you help me with my farm?")]
    )
    
    events = []
    async for event in runner.run_async(
        user_id="test_user",
        session_id=session.id,
        new_message=new_message
    ):
        events.append(event)
        
    assert len(events) > 0
    assert "mock agricultural advisor" in events[0].content.parts[0].text
