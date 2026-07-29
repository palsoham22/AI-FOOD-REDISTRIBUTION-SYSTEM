from .models import Notification


def create_notification(user, title, message, notification_type="INFO"):
    """
    Creates a notification for the specified user.
    """

    Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type
    )