from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from core.models import (
    Factory,
    SalePoint,
    Carrier,
    Factory,
    Product,
    FactoryWarehouse,
)


class UserRegistrationAPITest(APITestCase):

    def setUp(self):
        self.factory = Factory.objects.create(name="Factory 1")
        self.carrier = Carrier.objects.create(name="Carrier 1")
        self.sale_point = SalePoint.objects.create(name="Sale Point 1")

        self.admin_user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="adminpassword"
        )
        self.client.login(username="admin", password="adminpassword")

    def test_user_registration_in_groups(self):
        roles_and_ids = [
            ("factory", self.factory.id),
            ("carrier", self.carrier.id),
            ("sale_point", self.sale_point.id),
        ]

        for role, related_id in roles_and_ids:
            with self.subTest(role=role):
                url = reverse("register-user-list")
                data = {
                    "username": f"{role}_user",
                    "email": f"{role}_user@example.com",
                    "password": "securepassword",
                    "role": role,
                    f"{role}_id": related_id,
                }
                response = self.client.post(url, data, format="json")

                self.assertEqual(response.status_code, 201)
                self.assertEqual(response.data["username"], f"{role}_user")

                user = get_user_model().objects.get(username=f"{role}_user")
                self.assertTrue(user.groups.filter(name=role).exists())


class SalePointOrderTest(APITestCase):

    def setUp(self):
        # Создаем фабрику и продукт
        self.factory = Factory.objects.create(name="Factory 1", address="Address 1")
        self.product = Product.objects.create(
            name="Test Product", price=50, weight=10.0
        )
        self.factory.products.add(self.product)
        self.warehouse = FactoryWarehouse.objects.create(
            factory=self.factory, product=self.product, amount=100
        )
        self.sale_point = SalePoint.objects.create(
            name="Sale Point 1", address="Address 2"
        )

        # Создаем пользователя и связываем с торговой точкой
        self.user = get_user_model().objects.create_user(
            username="user1", password="password", email="user1@example.com"
        )
        self.user.sale_points.add(self.sale_point)

        # Аутентифицируем пользователя
        self.client.login(username="user1", password="password")

    def test_create_order_success(self):
        url = reverse("salepoint-create-order", args=[self.sale_point.id])
        data = {"product_id": self.product.id, "amount": 10}

        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "in_processing")
        self.assertEqual(FactoryWarehouse.objects.get(product=self.product).amount, 90)

    def test_create_order_insufficient_stock(self):
        # Проверка создания заказа с недостаточным количеством на складе
        url = reverse("salepoint-create-order", args=[self.sale_point.id])
        data = {"product_id": self.product.id, "amount": 200}

        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "Insufficient product quantity in the factory warehouse.",
            str(response.data),
        )
