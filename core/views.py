from django.contrib.auth.models import Group
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.routers import Response

from rest_framework.permissions import IsAuthenticated, AllowAny

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

from core.permissions import IsAdminUser, IsSelf

from django.contrib.auth import get_user_model

ExtendedUser = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpint that allows users to be viewed or edited.
    """

    queryset = ExtendedUser.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == "register":
            self.permission_classes = [AllowAny]
        elif self.action == "destroy":
            self.permission_classes = [IsAuthenticated, IsSelf | IsAdminUser]
        else:
            self.permission_classes = [IsAuthenticated, IsAdminUser]
        return super().get_permissions()

    @action(detail=False, methods=["post"])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"user": UserSerializer(user, context=self.get_serializer_context()).data}
        )


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """

    queryset = Group.objects.all().order_by("name")
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]


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
