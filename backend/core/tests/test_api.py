from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from django.urls import reverse
from core.models import Carrier, Factory, SalePoint


class UserRegistrationAPITest(APITestCase):

    def setUp(self):
        # Group.objects.create(name='factory')
        # Group.objects.create(name='carrier')
        # Group.objects.create(name='sale_point')

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

                print("Response status code:", response.status_code)
                print("Response data:", response.data)

                self.assertEqual(response.status_code, 201)
                self.assertEqual(response.data["username"], f"{role}_user")

                user = get_user_model().objects.get(username=f"{role}_user")
                self.assertTrue(user.groups.filter(name=role).exists())
