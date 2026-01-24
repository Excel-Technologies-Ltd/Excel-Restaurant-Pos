import socketio

# Configuration
BEARER_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYXptaW5AZXhjZWxiZC5jb20iLCJleHAiOjE3NjkyMzk5NTgsImlhdCI6MTc2OTIzNjM1OCwidHlwZSI6ImFjY2VzcyJ9.Ha6G3FJWyOJdiQ4K_xyBkWC7s5f2e2I68CI4siEC8_0"
BASE_URL = "https://arcpos.aninda.me"

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

if __name__ == "__main__":
    try:
        print(f"Connecting to {BASE_URL}...")
        
        # Try with polling first, then upgrade to websocket
        sio.connect(
            BASE_URL, 
            transports=['polling', 'websocket'],  # Try polling first
            socketio_path='/socket.io',
            auth={'token': BEARER_TOKEN},
            headers={'Authorization': f'Bearer {BEARER_TOKEN}'}
        )

        sio.wait()

    except Exception as e:
        print(f"Crash error: {e}")