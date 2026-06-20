import os
import pytest

@pytest.fixture(autouse=True, scope="session")
def setup_test_env():
    """Sets mock environment configurations to allow offline local testing without GCP credentials."""
    os.environ["GOOGLE_API_KEY"] = "AIzaSyFakeKeyForTesting12345678"
    os.environ["WEATHER_API_KEY"] = "fake_weather_key"
    # Disable VertexAI to avoid triggering Default Credentials checking during test suites
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "False"
