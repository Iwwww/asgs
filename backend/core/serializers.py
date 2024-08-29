from itertools import product
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers

from core.models import (
    Factory,
    Product,
    ProductCategory,
    FactoryWarehouse,
    ProductOrder,
    SalePoint,
    Carrier,
    Delivery,
)

ExtendedUser = get_user_model()


class UserSerializer(serializers.HyperlinkedModelSerializer):
    roles = serializers.SerializerMethodField()

    class Meta:
        model = ExtendedUser
        fields = ["id", "url", "username", "password", "email", "groups", "roles"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        groups_data = validated_data.pop("groups", [])
        user = ExtendedUser(**validated_data)
        user.set_password(password)
        user.save()

        user.groups.set(groups_data)

        default_group, created = Group.objects.get_or_create(name="user")
        user.groups.add(default_group)

        return user

    def get_roles(self, obj):
        return [group.name for group in obj.groups.all()]


class UniversalUserRegistrationSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(
        choices=[
            ("factory", "Factory"),
            ("carrier", "Carrier"),
            ("sale_point", "Sale Point"),
        ],
        write_only=True,
    )
    factory_id = serializers.PrimaryKeyRelatedField(
        queryset=Factory.objects.all(), write_only=True, required=False
    )
    carrier_id = serializers.PrimaryKeyRelatedField(
        queryset=Carrier.objects.all(), write_only=True, required=False
    )
    sale_point_id = serializers.PrimaryKeyRelatedField(
        queryset=SalePoint.objects.all(), write_only=True, required=False
    )
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    class Meta:
        model = ExtendedUser
        fields = [
            "username",
            "email",
            "password",
            "role",
            "factory_id",
            "carrier_id",
            "sale_point_id",
        ]

    def validate(self, attrs):
        role = attrs.get("role")
        if role == "factory" and not attrs.get("factory_id"):
            raise serializers.ValidationError(
                "Factory ID is required for role 'factory'."
            )
        if role == "carrier" and not attrs.get("carrier_id"):
            raise serializers.ValidationError(
                "Carrier ID is required for role 'carrier'."
            )
        if role == "sale_point" and not attrs.get("sale_point_id"):
            raise serializers.ValidationError(
                "Sale Point ID is required for role 'sale_point'."
            )
        return attrs

    def create(self, validated_data):
        role = validated_data.pop("role")
        factory = validated_data.pop("factory_id", None)
        carrier = validated_data.pop("carrier_id", None)
        sale_point = validated_data.pop("sale_point_id", None)

        user = ExtendedUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

        if role == "factory":
            group = Group.objects.get(name="factory")
            user.groups.add(group)
            user.factories.add(factory)
        elif role == "carrier":
            group = Group.objects.get(name="carrier")
            user.groups.add(group)
            user.carriers.add(carrier)
        elif role == "sale_point":
            group = Group.objects.get(name="sale_point")
            user.groups.add(group)
            user.sale_points.add(sale_point)

        return user


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ["url", "name"]


class ProductCategorySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ["id", "name", "description"]


class ProductSerializer(serializers.HyperlinkedModelSerializer):
    category_id = serializers.IntegerField(source="category.id")

    class Meta:
        model = Product
        fields = ["id", "name", "price", "category_id", "weight", "description"]


class FactorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Factory
        fields = ["id", "name", "address", "products"]


class FactoryWarehouseSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = FactoryWarehouse
        fields = ["product", "amount"]

    def validate_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Amount cannot be negative.")
        return value

    def create(self, validated_data):
        factory = self.context["factory"]  # Получаем фабрику из контекста
        validated_data["factory"] = factory
        return super().create(validated_data)

    def update(self, instance, validated_data):
        instance.amount = validated_data.get("amount", instance.amount)
        instance.save()
        return instance


class ProductOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductOrder
        fields = ["id", "product", "amount", "order_date", "status"]

    def validate(self, data):
        product = data.get("product")
        if product:
            factory_warehouse = FactoryWarehouse.objects.filter(
                product=product, factory__in=product.factories.all()
            ).first()

            if not factory_warehouse or factory_warehouse.amount < data.get("amount"):
                raise serializers.ValidationError(
                    f"Insufficient product quantity in the factory warehouse."
                )

        return data


class CreateOrderSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    amount = serializers.IntegerField()

    def validate(self, data):
        product = Product.objects.get(id=data["product_id"])
        if not product:
            raise serializers.ValidationError("Product does not exist.")

        sale_point = self.context["request"].user.sale_points.first()
        if not sale_point:
            raise serializers.ValidationError(
                "User is not associated with any sale point."
            )

        data["product"] = product
        data["sale_point"] = sale_point

        return data

    def create(self, validated_data):
        product = validated_data["product"]
        amount = validated_data["amount"]
        sale_point = validated_data["sale_point"]

        order = sale_point.create_order(product, amount)

        return order


class SalePointSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalePoint
        fields = ["id", "name", "address", "product_orders"]


class ProductsWithQuantitySerializer(serializers.Serializer):
    product = ProductSerializer()
    factory_id = serializers.IntegerField(source="factory.id")
    amount = serializers.IntegerField()


class CarrierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrier
        fields = ["id", "name"]


class DeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery
        fields = ["id", "carrier", "delivery_cost", "date", "priority"]
