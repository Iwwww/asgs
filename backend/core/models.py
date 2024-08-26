from django.contrib.auth.models import AbstractUser
from django.db import models


class ExtendedUser(AbstractUser):
    address = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    factories = models.ManyToManyField("Factory", related_name="users", blank=True)
    sale_points = models.ManyToManyField("SalePoint", related_name="users", blank=True)
    carriers = models.ManyToManyField("Carrier", related_name="users", blank=True)

    @property
    def role(self):
        if self.factories.exists():
            return "factory"
        if self.sale_points.exists():
            return "sale_point"
        if self.carriers.exists():
            return "carrier"
        return ""

    @property
    def groups_list(self):
        return [group.name for group in self.groups.all()]

    @property
    def is_sale_point_user(self):
        return self.sale_points.exists()


class ProductCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True, null=True)


class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(
        ProductCategory, on_delete=models.SET_NULL, null=True, blank=True
    )
    weight = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255, blank=True, null=True)


class Factory(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    products = models.ManyToManyField(
        Product, related_name="factories", blank=True
    )  # Replaces FactoryProducts


class FactoryWarehouse(models.Model):
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE)
    amount = models.IntegerField(default=0)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)


class ProductOrder(models.Model):
    STATUS_CHOICES = [
        ("in_processing", "In Processing"),
        ("delivery", "Delivery"),
        ("delivered", "Delivered"),
    ]

    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    amount = models.IntegerField()
    order_date = models.DateTimeField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="in_processing"
    )
    deliveries = models.ManyToManyField(
        "Delivery", related_name="product_orders", blank=True
    )  # Replaces ProductOrderDelivery


class SalePoint(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    product_orders = models.ManyToManyField(
        ProductOrder, related_name="sale_points", blank=True
    )  # Replaces SalePointProductOrder


class Carrier(models.Model):
    name = models.CharField(max_length=100)


class Delivery(models.Model):
    PRIORITY_CHOICES = [(1, "Low"), (2, "Medium"), (3, "High")]

    carrier = models.ForeignKey(Carrier, on_delete=models.PROTECT)
    delivery_cost = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField()
    priority = models.IntegerField(
        choices=PRIORITY_CHOICES, default=PRIORITY_CHOICES[0][0]
    )
