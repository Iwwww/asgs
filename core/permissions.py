from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow users in the admin group.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_superuser
                or request.user.groups.filter(name="admin").exists()
            )
        )


class IsSelf(permissions.BasePermission):
    """
    Custom permission to allow users to manage their own account.
    """

    def has_object_permission(self, request, view, obj):
        return obj == request.user
