import json
import logging
import os
import subprocess
import sys
import threading
import time
from typing import Any, Iterator
import pytest
import requests
from requests.exceptions import RequestException

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Run integration tests on port 8050 to avoid conflicts with port 8000
TEST_PORT = "8050"
BASE_URL = f"http://127.0.0.1:{TEST_PORT}"

def log_output(pipe: Any, log_func: Any) -> None:
    """Log the output from the given pipe."""
    for line in iter(pipe.readline, ""):
        log_func(line.strip())

def start_server() -> subprocess.Popen[str]:
    """Start the FastAPI backend server using subprocess on port 8050."""
    command = [
        sys.executable,
        "-m",
        "uvicorn",
        "backend.main:fastapi_app",
        "--host",
        "127.0.0.1",
        "--port",
        TEST_PORT,
    ]
    env = os.environ.copy()
    env["INTEGRATION_TEST"] = "TRUE"
    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
        env=env,
    )

    # Start threads to log stdout and stderr
    threading.Thread(
        target=log_output, args=(process.stdout, logger.info), daemon=True
    ).start()
    threading.Thread(
        target=log_output, args=(process.stderr, logger.error), daemon=True
    ).start()

    return process

def wait_for_server(timeout: int = 15, interval: int = 1) -> bool:
    """Wait for the server to be ready."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(BASE_URL, timeout=2)
            if response.status_code == 200:
                logger.info(f"Server is ready on port {TEST_PORT}")
                return True
        except RequestException:
            pass
        time.sleep(interval)
    logger.error(f"Server did not become ready on port {TEST_PORT} within {timeout} seconds")
    return False

@pytest.fixture(scope="session")
def server_fixture(request: Any) -> Iterator[subprocess.Popen[str]]:
    """Pytest fixture to start and stop the server for testing."""
    logger.info("Starting server process")
    server_process = start_server()
    if not wait_for_server():
        server_process.terminate()
        pytest.fail("Server failed to start")
    logger.info("Server process started")

    def stop_server() -> None:
        logger.info("Stopping server process")
        server_process.terminate()
        server_process.wait()
        logger.info("Server process stopped")

    request.addfinalizer(stop_server)
    yield server_process

def test_api_status(server_fixture: subprocess.Popen[str]) -> None:
    """Test the root endpoint for API status check."""
    response = requests.get(BASE_URL, timeout=5)
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["status"] == "online"
    assert "mcp_tools" in res_json

def test_analyze_crop_endpoint(server_fixture: subprocess.Popen[str]) -> None:
    """Test the crop analysis endpoint with Form fields (mimicking leaf checkup)."""
    payload = {
        "crop_name": "Tomato",
        "location": "California, USA",
        "symptoms": "Yellowing leaves with target spots",
        "farmer_id": "demo-farmer"
      }
    
    # Trigger request
    response = requests.post(
        f"{BASE_URL}/analyze-crop",
        data=payload,
        timeout=15
    )
    
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    assert "crop_analysis" in res_json
    assert "recommendation" in res_json
    assert len(res_json["activity_log"]) > 0

def test_chat_endpoint(server_fixture: subprocess.Popen[str]) -> None:
    """Test agricultural chat advisor endpoint."""
    payload = {
        "message": "What is the demand for Corn in California?",
        "session_id": "test-chat-session"
    }
    
    response = requests.post(
        f"{BASE_URL}/chat",
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=10
    )
    
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    assert "response" in res_json
    assert len(res_json["response"]) > 0
