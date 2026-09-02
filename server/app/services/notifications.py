"""Helpers for recording notifications from anywhere in the backend."""
from app.extensions import db
from app.models.notifications import Notification


def notify(type_, title, message="", related_type=None, related_id=None):
    """Queue a new notification row. Caller is responsible for committing."""
    notification = Notification(
        type=type_,
        title=title,
        message=message,
        related_type=related_type,
        related_id=related_id,
    )
    db.session.add(notification)
    return notification
