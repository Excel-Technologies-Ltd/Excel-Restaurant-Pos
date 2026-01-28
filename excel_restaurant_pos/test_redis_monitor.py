"""
Redis Monitor - Watch what Frappe publishes to Redis

This connects directly to Redis and monitors the "events" channel
to see what events Frappe is publishing.

Run this to verify:
1. Frappe is publishing events to Redis
2. What rooms/events are being sent
"""
import redis
import json
import os
from datetime import datetime

# Configuration - these should match your docker-compose redis service
REDIS_HOST = os.getenv("REDIS_HOST", "redis-queue")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

# If running outside docker, connect to exposed port
# REDIS_HOST = "localhost"
# REDIS_PORT = 6379

print("=" * 60)
print("Redis Event Monitor")
print("=" * 60)
print(f"Redis: {REDIS_HOST}:{REDIS_PORT}")
print("Subscribing to 'events' channel (same as your socket server)")
print("=" * 60)
print()


def monitor_events():
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
        r.ping()
        print(f"[CONNECTED] Connected to Redis at {REDIS_HOST}:{REDIS_PORT}")
        print()

        pubsub = r.pubsub()
        pubsub.subscribe('events')

        print("Monitoring 'events' channel...")
        print("Update a document in Frappe to see events here")
        print("Press Ctrl+C to stop")
        print()

        for message in pubsub.listen():
            if message['type'] == 'message':
                timestamp = datetime.now().strftime("%H:%M:%S")
                print(f"\n[{timestamp}] REDIS EVENT RECEIVED")
                print("=" * 60)

                try:
                    data = json.loads(message['data'])
                    print(f"  Namespace: {data.get('namespace', 'N/A')}")
                    print(f"  Room: {data.get('room', 'N/A (broadcast)')}")
                    print(f"  Event: {data.get('event', 'N/A')}")
                    print(f"  Message: {json.dumps(data.get('message', {}), indent=4)}")
                except json.JSONDecodeError:
                    print(f"  Raw: {message['data']}")

                print("=" * 60)

            elif message['type'] == 'subscribe':
                print(f"[SUBSCRIBED] to channel: {message['channel']}")

    except redis.ConnectionError as e:
        print(f"[ERROR] Cannot connect to Redis: {e}")
        print()
        print("If running outside docker, make sure:")
        print("1. Redis port is exposed in docker-compose")
        print("2. Set REDIS_HOST=localhost and correct REDIS_PORT")
        print()
        print("Or run this script inside the docker container:")
        print("  docker exec -it <container> python test_redis_monitor.py")
    except KeyboardInterrupt:
        print("\nStopped monitoring")


if __name__ == "__main__":
    monitor_events()
