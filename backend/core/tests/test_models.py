from django.test import TestCase
from django.contrib.auth import get_user_model
from core.models import (
    ProductCategory,
    Product,
    Factory,
    FactoryWarehouse,
    ProductOrder,
    SalePoint,
    Carrier,
)
from django.db import IntegrityError
from django.contrib.auth.models import Group
from django.utils import timezone


class ModelsTestCase(TestCase):

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="testuser", email="testuser@example.com", password="testpassword"
        )
        self.factory = Factory.objects.create(
            name="Test Factory", address="Factory Address"
        )
        self.product_category = ProductCategory.objects.create(name="Test Category")
        self.product = Product.objects.create(
            name="Test Product",
            price=100.0,
            category=self.product_category,
            weight=10.0,
        )
        self.sale_point = SalePoint.objects.create(
            name="Test Sale Point", address="Sale Point Address"
        )
        self.carrier = Carrier.objects.create(name="Test Carrier")

    def test_extended_user_creation(self):
        # Проверка создания пользователя
        self.assertEqual(self.user.username, "testuser")
        self.assertEqual(self.user.email, "testuser@example.com")

    def test_get_role_method(self):
        # Проверка метода get_role
        self.user.factories.add(self.factory)
        self.assertEqual(self.user.role, "factory")

    def test_get_groups_method(self):
        # Проверка метода get_groups
        factory_group, _ = Group.objects.get_or_create(name="factory")
        sale_point_group, _ = Group.objects.get_or_create(name="sale_point")
        self.user.groups.add(factory_group, sale_point_group)
        self.assertListEqual(self.user.groups_list, ["factory", "sale_point"])

    def test_product_creation(self):
        # Проверка создания продукта
        self.assertEqual(self.product.name, "Test Product")
        self.assertEqual(self.product.price, 100.0)
        self.assertEqual(self.product.category, self.product_category)

    def test_factory_warehouse_creation(self):
        # Проверка создания записи на складе фабрики
        warehouse_entry = FactoryWarehouse.objects.create(
            factory=self.factory, product=self.product, amount=100
        )
        self.assertEqual(warehouse_entry.factory, self.factory)
        self.assertEqual(warehouse_entry.product, self.product)
        self.assertEqual(warehouse_entry.amount, 100)

    def test_product_order_creation(self):
        # Проверка создания заказа на продукт
        order = ProductOrder.objects.create(
            product=self.product, amount=10, order_date=timezone.now()
        )
        self.assertEqual(order.product, self.product)
        self.assertEqual(order.amount, 10)
        self.assertEqual(order.status, "in_processing")

    def test_product_protect_on_delete(self):
        # Проверка, что продукт не удалится, если он связан с заказом
        order = ProductOrder.objects.create(
            product=self.product, amount=10, order_date=timezone.now()
        )
        with self.assertRaises(IntegrityError):
            self.product.delete()

    def test_user_factory_relationship(self):
        # Проверка ManyToMany связи между пользователем и фабрикой
        self.user.factories.add(self.factory)
        self.assertIn(self.factory, self.user.factories.all())

    def test_user_sale_point_relationship(self):
        # Проверка ManyToMany связи между пользователем и торговой точкой
        self.user.sale_points.add(self.sale_point)
        self.assertIn(self.sale_point, self.user.sale_points.all())

    def test_user_carrier_relationship(self):
        # Проверка ManyToMany связи между пользователем и перевозчиком
        self.user.carriers.add(self.carrier)
        self.assertIn(self.carrier, self.user.carriers.all())
