import socketio
import requests
import os
import sys

# Configuration
ENVIRONMENT = os.getenv("ENV", "production")  # production, local-backend, local-frontend
AUTH_MODE = os.getenv("AUTH_MODE", "bearer")  # "bearer" (recommended) or "session"

CONFIGS = {
    "production": {
        "url": "https://arcpos.aninda.me",
        "site": "arcpos.aninda.me"
    },
    "local-backend": {
        "url": "http://backend:8000",
        "site": "pos.localhost"
    },
    "local-frontend": {
        "url": "http://frontend:8080",
        "site": "pos.localhost"
    },
    "host-local": {
        "url": "http://pos.localhost:2008",
        "site": "pos.localhost"
    }
}

if ENVIRONMENT not in CONFIGS:
    print(f"❌ Unknown environment: {ENVIRONMENT}")
    print(f"Available: {', '.join(CONFIGS.keys())}")
    sys.exit(1)

config = CONFIGS[ENVIRONMENT]
BASE_URL = config["url"]
SITE_NAME = config["site"]

# Authentication credentials
USERNAME = "azmin@excelbd.com"
PASSWORD = "Azmin@123#"

# Optional: Use pre-generated Bearer token (set via environment variable)
BEARER_TOKEN = os.getenv("BEARER_TOKEN")

print(f"🔧 Environment: {ENVIRONMENT}")
print(f"🌐 Base URL: {BASE_URL}")
print(f"📍 Site: {SITE_NAME}")
print(f"🔐 Auth Mode: {AUTH_MODE}")
print("")


def get_bearer_token():
    """Get JWT Bearer token from your custom auth endpoint"""
    if BEARER_TOKEN:
        print(f"🎫 Using pre-set Bearer token: {BEARER_TOKEN[:40]}...")
        return BEARER_TOKEN

    print("🔐 Getting Bearer token from API...")

    # Use your custom JWT auth endpoint
    auth_endpoint = "/api/method/excel_restaurant_pos.api.auth.login.login"

    headers = {
        "X-Frappe-Site-Name": SITE_NAME,
        "Content-Type": "application/json"
    }

    auth_data = {
        "user": USERNAME,
        "pwd": PASSWORD
    }

    try:
        response = requests.post(
            f"{BASE_URL}{auth_endpoint}",
            json=auth_data,
            headers=headers
        )

        if response.status_code == 200:
            data = response.json()

            # Extract token from response
            # Your API returns: {"message": {"data": {"access_token": "..."}}}
            token = None
            if isinstance(data, dict):
                message = data.get("message", {})
                if isinstance(message, dict):
                    data_obj = message.get("data", {})
                    if isinstance(data_obj, dict):
                        token = data_obj.get("access_token")

                # Fallback: check for token at root level
                if not token:
                    token = (
                        data.get("token") or
                        data.get("access_token") or
                        message.get("access_token")
                    )

            if token:
                print(f"✅ Got Bearer token: {token[:40]}...")
                return token
            else:
                raise Exception(f"No access_token in response: {data}")

        else:
            error_msg = response.text
            raise Exception(f"Login failed: {response.status_code} - {error_msg}")

    except Exception as e:
        print(f"❌ Failed to get Bearer token: {e}")
        raise Exception(f"Could not authenticate: {e}")


def get_session_cookie():
    """Get session cookie via traditional login (fallback method)"""
    print("🔐 Authenticating with session cookies...")

    login_url = f"{BASE_URL}/api/method/login"
    login_data = {
        "usr": USERNAME,
        "pwd": PASSWORD
    }

    headers = {
        "X-Frappe-Site-Name": SITE_NAME
    }

    response = requests.post(login_url, data=login_data, headers=headers)

    if response.status_code != 200:
        raise Exception(f"Login failed: {response.status_code} - {response.text}")

    cookies = response.cookies

    if 'sid' not in cookies:
        raise Exception("No session cookie received from login")

    print(f"✅ Authenticated with session. SID: {cookies.get('sid')[:20]}...")
    return cookies


# Create Socket.IO client
sio = socketio.Client(logger=True, engineio_logger=True)


@sio.event
def connect():
    print(f"✅ Socket connected! ID: {sio.sid}")


@sio.event
def connect_error(data):
    print(f"❌ Socket connection failed: {data}")


@sio.event
def disconnect():
    print("⚠️ Disconnected from server")


@sio.on('*')
def catch_all(event, data):
    print(f"📨 Received event '{event}': {data}")


if __name__ == "__main__":
    try:
        headers = {
            'X-Frappe-Site-Name': SITE_NAME
        }

        if AUTH_MODE == "bearer":
            # Bearer token authentication (recommended)
            token = get_bearer_token()
            headers['Authorization'] = f'Bearer {token}'
            print(f"🔌 Connecting to Socket.IO with Bearer token...")

        else:
            # Session cookie authentication (traditional method)
            cookies = get_session_cookie()
            cookie_dict = {cookie.name: cookie.value for cookie in cookies}
            headers['Cookie'] = '; '.join([f"{name}={value}" for name, value in cookie_dict.items()])
            print(f"🔌 Connecting to Socket.IO with session cookies...")

        # Connect to Socket.IO
        sio.connect(
            BASE_URL,
            transports=['polling', 'websocket'],
            socketio_path='/socket.io',
            headers=headers
        )

        print("✅ Socket.IO connection established. Waiting for events...")
        print("   Press Ctrl+C to disconnect")
        print("")

        # Wait for events
        sio.wait()

    except KeyboardInterrupt:
        print("\n⚠️  Interrupted by user")
        sio.disconnect()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
