from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework import serializers

from core.models import (
    Factory,
    FactoryProducts,
    Product,
    ProductCategory,
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

ExtendedUser = get_user_model()


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ExtendedUser
        fields = ["url", "username", "email", "groups"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = ExtendedUser.objects.create_user(**validated_data)

        # Add the user to the default group
        default_group, created = Group.objects.get_or_create(name="user")
        user.groups.add(default_group)

        return user


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ["url", "name"]


class ProductCategorySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ["name", "description"]


class ProductSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Product
        fields = ["name", "price", "category", "weight", "description"]

        from rest_framework import serializers


class FactorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Factory
        fields = ["name", "address"]


class FactoryProductsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FactoryProducts
        fields = ["factory", "product"]


class FactoryWarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = FactoryWarehouse
        fields = ["factory", "product"]


class ProductOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductOrder
        fields = ["product", "amount", "order_date", "status"]


class SalePointSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalePoint
        fields = ["name", "address"]


class SalePointProductOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalePointProductOrder
        fields = ["sale_point", "product_order"]


class SalePointUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalePointUser
        fields = ["sale_point", "user"]


class CarrierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrier
        fields = ["name"]


class CarrierUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarrierUser
        fields = ["carrier", "user"]


class DeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery
        fields = ["carrier", "delivery_cost", "date", "priority"]


class ProductOrderDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductOrderDelivery
        fields = ["product_order", "delivery"]
