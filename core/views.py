from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets

from core.models import (
    ProductCategory,
    Product,
    Factory,
    FactoryProducts,
    FactoryWarehouse,
    ProductOrder,
    SalePoint,
    SalePointProductOrder,
    SalePointUser,
    Carrier,
    CarrierUser,
    Delivery,
    ProductOrderDelivery,
)

from core.serializers import (
    GroupSerializer,
    ProductCategorySerializer,
    ProductSerializer,
    UserSerializer,
    FactorySerializer,
    FactoryProductsSerializer,
    FactoryWarehouseSerializer,
    ProductOrderSerializer,
    SalePointSerializer,
    SalePointProductOrderSerializer,
    SalePointUserSerializer,
    CarrierSerializer,
    CarrierUserSerializer,
    DeliverySerializer,
    ProductOrderDeliverySerializer,
)

# from django.contrib.auth import get_user_model

# User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpint that allows users to be viewed or edited.
    """

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """

    queryset = Group.objects.all().order_by("name")
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProductCategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows category of product to be viewed or edited.
    """

    queryset = ProductCategory.objects.all().order_by("name")
    serializer_class = ProductCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product to be viewed or edited.
    """

    queryset = Product.objects.all().order_by("name")
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]


class FactoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows factories to be viewed or edited.
    """

    queryset = Factory.objects.all().order_by("name")
    serializer_class = FactorySerializer
    permission_classes = [permissions.IsAuthenticated]


class FactoryProductsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows factory products to be viewed or edited.
    """

    queryset = FactoryProducts.objects.all()
    serializer_class = FactoryProductsSerializer
    permission_classes = [permissions.IsAuthenticated]


class FactoryWarehouseViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows factory warehouses to be viewed or edited.
    """

    queryset = FactoryWarehouse.objects.all()
    serializer_class = FactoryWarehouseSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProductOrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product orders to be viewed or edited.
    """

    queryset = ProductOrder.objects.all()
    serializer_class = ProductOrderSerializer
    permission_classes = [permissions.IsAuthenticated]


class SalePointViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows sale points to be viewed or edited.
    """

    queryset = SalePoint.objects.all().order_by("name")
    serializer_class = SalePointSerializer
    permission_classes = [permissions.IsAuthenticated]


class SalePointProductOrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows sale point product orders to be viewed or edited.
    """

    queryset = SalePointProductOrder.objects.all()
    serializer_class = SalePointProductOrderSerializer
    permission_classes = [permissions.IsAuthenticated]


class SalePointUserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows sale point users to be viewed or edited.
    """

    queryset = SalePointUser.objects.all()
    serializer_class = SalePointUserSerializer
    permission_classes = [permissions.IsAuthenticated]


class CarrierViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows carriers to be viewed or edited.
    """

    queryset = Carrier.objects.all().order_by("name")
    serializer_class = CarrierSerializer
    permission_classes = [permissions.IsAuthenticated]


class CarrierUserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows carrier users to be viewed or edited.
    """

    queryset = CarrierUser.objects.all()
    serializer_class = CarrierUserSerializer
    permission_classes = [permissions.IsAuthenticated]


class DeliveryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows deliveries to be viewed or edited.
    """

    queryset = Delivery.objects.all()
    serializer_class = DeliverySerializer
    permission_classes = [permissions.IsAuthenticated]


class ProductOrderDeliveryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product order deliveries to be viewed or edited.
    """

    queryset = ProductOrderDelivery.objects.all()
    serializer_class = ProductOrderDeliverySerializer
    permission_classes = [permissions.IsAuthenticated]
