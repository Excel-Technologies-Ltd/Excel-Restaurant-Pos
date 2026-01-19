"""
Utility functions for publishing events to the custom Socket.IO server
"""

import json
import frappe
from frappe.utils.background_jobs import get_redis_connection_without_auth


def publish_event(event, message, room=None, namespace="/excel_restaurant_pos/default"):
    """
    Publish an event to the custom Socket.IO server via Redis

    Args:
        event: Event name (e.g., "order:updated")
        message: Message payload (dict)
        room: Optional room name to target specific clients
        namespace: Socket.IO namespace (default: /excel_restaurant_pos/default)
    """
    try:
        redis_client = get_redis_connection_without_auth()
        data = {
            "namespace": namespace,
            "room": room,
            "event": event,
            "message": message,
        }
        redis_client.publish("excel_restaurant_pos_events", json.dumps(data))
    except Exception as e:
        frappe.log_error(
            f"Failed to publish socket event: {str(e)}", "Socket Event Error"
        )


def publish_to_user(user, event, message, namespace="/excel_restaurant_pos/default"):
    """
    Publish an event to a specific user

    Args:
        user: Username
        event: Event name
        message: Message payload
        namespace: Socket.IO namespace
    """
    publish_event(event, message, room=f"user:{user}", namespace=namespace)


def publish_to_room(room, event, message, namespace="/excel_restaurant_pos/default"):
    """
    Publish an event to a specific room

    Args:
        room: Room name (e.g., "kitchen", "order:123")
        event: Event name
        message: Message payload
        namespace: Socket.IO namespace
    """
    publish_event(event, message, room=room, namespace=namespace)
