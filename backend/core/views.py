from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.routers import Response

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework import status

from core import serializers
from core.models import (
    FactoryUser,
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
    FactoryUserSerializer,
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
    WarehouseProductCountSerializer,
)

from core.permissions import (
    CanDeleteProduct,
    IsAdminUser,
    IsFactoryGroup,
    IsSalePointAdmin,
    IsSelf,
)

from django.contrib.auth import get_user_model

ExtendedUser = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    queryset = ExtendedUser.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == "register":
            permission_classes = [AllowAny]
        elif self.action == "destroy":
            permission_classes = [IsAuthenticated, IsSelf | IsAdminUser]
        else:
            permission_classes = [IsAuthenticated | IsAdminUser]
        return super().get_permissions()

    @action(detail=False, methods=["post"])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"user": UserSerializer(user, context=self.get_serializer_context()).data}
        )


class UserInfoView(APIView):
    def get(self, request):
        user = request.user
        user_data = {
            "username": user.username,
            "email": user.email,
            "role": user.get_role(),
            "groups": user.get_groups(),
        }
        return Response(user_data)


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
    permission_classes = [permissions.IsAuthenticated, IsFactoryGroup]

    def get_permissions(self):
        if self.action == "list" or self.action == "retrieve":
            permission_classes = [
                permissions.IsAuthenticated,
                IsAuthenticated | IsFactoryGroup,
            ]
        elif (
            self.action == "create"
            or self.action == "update"
            or self.action == "partial_update"
            or self.action == "destroy"
        ):
            permission_classes = [
                permissions.IsAuthenticated,
                IsAdminUser | IsFactoryGroup,
            ]
        else:
            permission_classes = [permissions.IsAuthenticated, IsAdminUser]
        return super().get_permissions()


class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows products to be viewed or edited.
    """

    queryset = Product.objects.all().order_by("name")
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsFactoryGroup]

    def perform_create(self, serializer):
        product = serializer.save()

        user = self.request.user

        try:
            factory_user = FactoryUser.objects.get(user=user)
            factory = factory_user.factory

            FactoryProducts.objects.create(factory=factory, product=product)

        except FactoryUser.DoesNotExist:
            raise serializers.ValidationError(
                "User is not associated with any factory."
            )

class FactoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows factories to be viewed or edited.
    """

    queryset = Factory.objects.all().order_by("name")
    serializer_class = FactorySerializer
    permission_classes = [permissions.IsAuthenticated]


class FactoryUserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows FactoryUsers to be viewed or edited.
    """

    queryset = FactoryUser.objects.all()
    serializer_class = FactoryUserSerializer
    permission_classes = [IsFactoryGroup]


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

    @action(
        detail=False,
        methods=["get", "post", "put", "delete"],
        permission_classes=[IsFactoryGroup],
    )
    def product_counts(self, request):
        """
        Custom endpoint to get, create, update, or delete product counts in warehouse.
        Only accessible by users in the factory group.
        """
        if request.method == "GET":
            warehouse_products = FactoryWarehouse.objects.all()
            serializer = WarehouseProductCountSerializer(warehouse_products, many=True)
            return Response(serializer.data)

        elif request.method == "POST":
            serializer = WarehouseProductCountSerializer(
                data=request.data, many=True, context={"request": request}
            )
            if serializer.is_valid():
                serializer.save()
                # After saving, delete any rows with zero quantity
                FactoryWarehouse.objects.filter(amount=0).delete()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == "PUT":
            data = request.data
            if isinstance(data, dict):  # Handle single object update
                data = [data]

            for item in data:
                try:
                    instance = FactoryWarehouse.objects.get(
                        product_id=item["product_id"]
                    )
                    serializer = WarehouseProductCountSerializer(
                        instance, data=item, partial=True, context={"request": request}
                    )
                    if serializer.is_valid():
                        serializer.save()
                    else:
                        return Response(
                            serializer.errors, status=status.HTTP_400_BAD_REQUEST
                        )
                except FactoryWarehouse.DoesNotExist:
                    return Response(
                        {"error": f'Product with ID {item["product_id"]} not found.'},
                        status=status.HTTP_404_NOT_FOUND,
                    )
            return Response({"detail": "Update successful"}, status=status.HTTP_200_OK)

        elif request.method == "DELETE":
            product_id = request.data.get("product_id")
            try:
                instance = FactoryWarehouse.objects.get(product_id=product_id)
                instance.delete()
                return Response(
                    {"detail": "Delete successful"}, status=status.HTTP_204_NO_CONTENT
                )
            except FactoryWarehouse.DoesNotExist:
                return Response(
                    {"error": f"Product with ID {product_id} not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )


class ProductOrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product orders to be viewed or edited.
    """

    queryset = ProductOrder.objects.all()
    serializer_class = ProductOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [IsAuthenticated, IsSalePointAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return super().get_permissions()

    def perform_create(self, serializer):
        product = serializer.validated_data["product"]
        # Проверяем, что продукт добавлен фабрикой
        factory_product_exists = FactoryProducts.objects.filter(
            product=product
        ).exists()
        if not factory_product_exists:
            raise ValidationError("The product must be added by a factory.")
        serializer.save()


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
