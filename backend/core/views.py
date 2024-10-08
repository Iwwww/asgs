from itertools import product
from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError
from django.db.models.query import transaction
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.schemas.coreapi import serializers
from rest_framework.views import APIView, status

from core.models import (
    Factory,
    ProductCategory,
    Product,
    FactoryWarehouse,
    ProductOrder,
    SalePoint,
    Carrier,
    Delivery,
)

from core.serializers import (
    CreateOrderSerializer,
    GroupSerializer,
    ProductCategorySerializer,
    ProductSerializer,
    ProductsWithQuantitySerializer,
    UniversalUserRegistrationSerializer,
    UserSerializer,
    FactorySerializer,
    FactoryWarehouseSerializer,
    ProductOrderSerializer,
    SalePointSerializer,
    CarrierSerializer,
    DeliverySerializer,
)

from core.permissions import (
    IsAdminUser,
    IsCarrierUser,
    IsFactoryGroup,
    IsSalePointUser,
    IsSelf,
)

from django.contrib.auth import get_user_model

ExtendedUser = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = ExtendedUser.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == "register":
            self.permission_classes = [AllowAny]
        elif self.action == "destroy":
            self.permission_classes = [IsAuthenticated, IsSelf | IsAdminUser]
        else:
            self.permission_classes = [IsAuthenticated | IsAdminUser]
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
            "role": user.role,
            "groups": user.groups_list,
        }
        return Response(user_data)


class UniversalUserRegistrationViewSet(viewsets.ModelViewSet):
    queryset = ExtendedUser.objects.all()
    serializer_class = UniversalUserRegistrationSerializer
    permission_classes = [IsAdminUser]


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by("name")
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]


class ProductCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProductCategory.objects.all().order_by("name")
    serializer_class = ProductCategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsFactoryGroup]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            self.permission_classes = [
                permissions.IsAuthenticated,
                IsFactoryGroup,
            ]
        elif self.action in ["create", "update", "partial_update", "destroy"]:
            self.permission_classes = [
                permissions.IsAuthenticated,
                IsAdminUser | IsFactoryGroup,
            ]
        else:
            self.permission_classes = [permissions.IsAuthenticated, IsAdminUser]
        return super().get_permissions()


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("name")
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsFactoryGroup]

    def perform_create(self, serializer):
        product = serializer.save()

        user = self.request.user
        if not user.factories.exists():
            raise ValidationError("User is not associated with any factory.")

        factory = user.factories.first()
        factory.products.add(product)


class FactoryViewSet(viewsets.ModelViewSet):
    queryset = Factory.objects.all().order_by("name")
    serializer_class = FactorySerializer
    permission_classes = [permissions.IsAuthenticated]


class FactoryWarehouseViewSet(viewsets.ModelViewSet):
    queryset = FactoryWarehouse.objects.all()
    serializer_class = FactoryWarehouseSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(
        detail=False,
        methods=["get", "post", "put"],
        permission_classes=[IsFactoryGroup],
    )
    def product_counts(self, request):
        if request.method == "GET":
            warehouse_products = self.get_queryset()
            serializer = self.get_serializer(warehouse_products, many=True)
            return Response(serializer.data)

        elif request.method == "POST":
            return self._handle_post_request(request)

        elif request.method == "PUT":
            return self._handle_put_request(request)

    def _handle_post_request(self, request):
        user = self.request.user
        factory = user.factories.first()  # Получаем фабрику, связанную с пользователем

        if not factory:
            return Response(
                {"error": "User is not associated with any factory."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(
            data=request.data,
            many=True,
            context={"request": request, "factory": factory},
        )
        if serializer.is_valid():
            with transaction.atomic():
                serializer.save()
                FactoryWarehouse.objects.filter(quantity=0).delete()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _handle_put_request(self, request):
        user = self.request.user
        factory = user.factories.first()  # Получаем фабрику, связанную с пользователем

        if not factory:
            return Response(
                {"error": "User is not associated with any factory."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = request.data
        if isinstance(data, dict):
            data = list(data.values())

        responses = []
        with transaction.atomic():
            for item in data:
                try:
                    instance = FactoryWarehouse.objects.get(
                        product_id=item["product"], factory=factory
                    )
                    serializer = self.get_serializer(
                        instance,
                        data=item,
                        partial=True,
                        context={"request": request, "factory": factory},
                    )
                    if serializer.is_valid():
                        serializer.save()
                        responses.append(
                            {"product_id": instance.product.id, "status": "updated"}
                        )
                    else:
                        return Response(
                            serializer.errors, status=status.HTTP_400_BAD_REQUEST
                        )
                except FactoryWarehouse.DoesNotExist:
                    return Response(
                        {
                            "error": f'Product with ID {item["product"]} not found in factory.'
                        },
                        status=status.HTTP_404_NOT_FOUND,
                    )
        FactoryWarehouse.objects.filter(quantity=0).delete()
        return Response(responses, status=status.HTTP_200_OK)


class ProductOrderViewSet(viewsets.ModelViewSet):
    queryset = (
        ProductOrder.objects.all()
        .select_related("product")
        .prefetch_related("sale_points", "product__factorywarehouse__factory")
    )
    permission_classes = [permissions.IsAuthenticated | IsCarrierUser]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            self.permission_classes = [IsSalePointUser | IsCarrierUser | IsAdminUser]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.sale_points.exists():
            return ProductOrder.objects.filter(sale_points__in=user.sale_points.all())
        return ProductOrder.objects.all().order_by("order_date")

    def get_serializer_class(self):
        if self.action == "create":
            return CreateOrderSerializer
        return ProductOrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def perform_create(self, serializer):
        orders_data = serializer.validated_data

        orders = []
        for order_data in orders_data:
            product = order_data["product"]
            quantity = order_data["quantity"]
            sale_point = order_data["sale_point"]

            factory_warehouse = FactoryWarehouse.objects.filter(product=product).first()
            if factory_warehouse is None or factory_warehouse.quantity < quantity:
                raise ValidationError(
                    f"Insufficient product quantity in the factory warehouse for product {product.name}."
                )

            order = ProductOrder.create_order(ProductOrder, product, quantity)
            orders.append(order)

        return orders

    @action(detail=False, methods=["patch"], url_path="bulk-update-status")
    def bulk_update_status(self, request):
        orders_data = request.data
        if not isinstance(orders_data, list):
            return Response(
                {"error": "Data should be a list of orders."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated_orders = []
        with transaction.atomic():
            for order_data in orders_data:
                order_id = order_data.get("id")
                new_status = order_data.get("status")

                if not order_id or not new_status:
                    return Response(
                        {"error": "Each order must contain 'id' and 'status'."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                try:
                    order = ProductOrder.objects.get(id=order_id)
                except ProductOrder.DoesNotExist:
                    return Response(
                        {"error": f"Order with id {order_id} does not exist."},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                if new_status not in dict(ProductOrder.STATUS_CHOICES):
                    return Response(
                        {
                            "error": f"Invalid status '{new_status}' for order with id {order_id}."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                order.status = new_status
                order.save()
                updated_orders.append(order)

        return Response(
            {
                "status": "Orders updated successfully.",
                "updated_orders": len(updated_orders),
            },
            status=status.HTTP_200_OK,
        )


class SalePointViewSet(viewsets.ModelViewSet):
    queryset = SalePoint.objects.all().order_by("name")
    serializer_class = SalePointSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["post"], serializer_class=CreateOrderSerializer)
    def create_order(self, request, pk=None):
        sale_point = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order = serializer.save()
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"order_id": order.id, "status": order.status},
            status=status.HTTP_201_CREATED,
        )


class ProductsWithQuantityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FactoryWarehouse.objects.all()
    serializer_class = ProductsWithQuantitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CarrierViewSet(viewsets.ModelViewSet):
    queryset = Carrier.objects.all().order_by("name")
    serializer_class = CarrierSerializer
    permission_classes = [permissions.IsAuthenticated]


class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all()
    serializer_class = DeliverySerializer
    permission_classes = [permissions.IsAuthenticated]
