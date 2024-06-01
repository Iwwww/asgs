from rest_framework import permissions

from core.models import FactoryProducts


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


class IsFactoryGroup(permissions.BasePermission):
    """
    Custom permission to only allow users in the factory group to create products and product categories.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name="factory").exists()
        )


class CanDeleteProduct(permissions.BasePermission):
    """
    Custom permission to allow users to delete products only if they are not created in their factory.
    """

    def has_object_permission(self, request, view, obj):
        if request.method != "DELETE":
            return True
        factory_products = FactoryProducts.objects.filter(
            product=obj,
            factory__in=request.user.sale_pointuser_set.all().values(
                "sale_point__factory"
            ),
        )
        return not factory_products.exists()


class IsSalePointAdmin(permissions.BasePermission):
    """
    Custom permission to only allow sale point admins to create product orders.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name="sale_point_admin").exists()
        )
