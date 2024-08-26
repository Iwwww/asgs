from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


class ExtendedUser(AbstractUser):
    address = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def get_role(self):
        roles = ["factory", "sale_point", "carrier"]
        for role in roles:
            if self.groups.filter(name=role).exists():
                return role
        return ""

    def get_groups(self):
        return [group.name for group in self.groups.all()]


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


class FactoryProducts(models.Model):
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)


class FactoryWarehouse(models.Model):
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE)
    amount = models.IntegerField(default=0)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)


class FactoryUser(models.Model):
    factory = models.ForeignKey(
        Factory, on_delete=models.CASCADE, related_name="factory_users"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="factories"
    )

    def __str__(self):
        # Correct way to access the username from the related User object
        return f"{self.user.username} - {self.factory.name}"

    class Meta:
        unique_together = ("factory", "user")


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


class SalePoint(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255)


class SalePointProductOrder(models.Model):
    sale_point = models.ForeignKey(SalePoint, on_delete=models.CASCADE)
    product_order = models.ForeignKey(ProductOrder, on_delete=models.CASCADE)


class SalePointUser(models.Model):
    sale_point = models.ForeignKey(SalePoint, on_delete=models.CASCADE)
    user = models.ForeignKey(ExtendedUser, on_delete=models.CASCADE)


class Carrier(models.Model):
    name = models.CharField(max_length=100)


class CarrierUser(models.Model):
    carrier = models.ForeignKey(Carrier, on_delete=models.CASCADE)
    user = models.ForeignKey(ExtendedUser, on_delete=models.CASCADE)


class Delivery(models.Model):
    PRIORITY_CHOICES = [(1, "Low"), (2, "Medium"), (3, "High")]

    carrier = models.ForeignKey(Carrier, on_delete=models.PROTECT)
    delivery_cost = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField()
    priority = models.IntegerField(
        choices=PRIORITY_CHOICES, default=PRIORITY_CHOICES[0]
    )


class ProductOrderDelivery(models.Model):
    product_order = models.ForeignKey(ProductOrder, on_delete=models.PROTECT)
    delivery = models.ForeignKey(Delivery, on_delete=models.CASCADE)
