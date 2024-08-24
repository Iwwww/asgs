from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework import serializers

from core.models import (
    Factory,
    FactoryProducts,
    FactoryUser,
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
    roles = serializers.SerializerMethodField()

    class Meta:
        model = ExtendedUser
        fields = ["id", "url", "username", "password", "email", "groups", "roles"]
        extra_kwargs = {"password": {"write_only": True}}

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


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ["url", "name"]


class ProductCategorySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ["id", "name", "description"]


class ProductSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "price", "category", "weight", "description"]

        from rest_framework import serializers


class FactorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Factory
        fields = ["id", "name", "address"]


class FactoryUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = FactoryUser
        fields = "__all__"


class FactoryProductsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FactoryProducts
        fields = ["factory", "product"]


class FactoryWarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = FactoryWarehouse
        fields = ["factory", "product"]


class WarehouseProductCountSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source="product.id")
    amount = serializers.IntegerField()

    class Meta:
        model = FactoryWarehouse
        fields = ["product_id", "amount"]

    def validate(self, data):
        user = self.context["request"].user

        try:
            factory_user = FactoryUser.objects.get(user=user)
            factory = factory_user.factory
        except FactoryUser.DoesNotExist:
            raise serializers.ValidationError(
                {"detail": "User is not associated with any factory."}
            )

        product_id = data["product"]["id"]
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            raise serializers.ValidationError(
                {"detail": f"Product with ID {product_id} does not exist."}
            )

        data["factory"] = factory
        data["product"] = product

        return data

    def create(self, validated_data):
        instance = FactoryWarehouse.objects.create(**validated_data)
        return instance

    def update(self, instance, validated_data):
        product_data = validated_data.pop("product", None)
        if product_data:
            product_id = product_data
            instance.product_id = product_id
        instance.amount = validated_data.get("amount", instance.amount)
        instance.save()

        if instance.amount == 0:
            instance.delete()

        return instance


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
