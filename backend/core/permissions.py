from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
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
    def has_object_permission(self, request, view, obj):
        return obj == request.user


class IsFactoryGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name="factory").exists()
        )


class CanDeleteProduct(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method != "DELETE":
            return True
        return not obj.factories.exists()


class IsSalePointUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_sale_point_user


class IsCarrierUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_carrier_user
