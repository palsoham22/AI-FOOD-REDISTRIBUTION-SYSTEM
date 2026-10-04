from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """
    Permission class that grants access only to authenticated users
    with role == 'ADMIN'.
    """
    message = "Access restricted to Administrator role."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            getattr(request.user, "role", None) == "ADMIN"
        )

