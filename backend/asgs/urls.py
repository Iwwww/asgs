from django.urls import path, include

from rest_framework import routers

from rest_framework.authtoken.views import obtain_auth_token

from core import views

router = routers.DefaultRouter()
router.register(r"users", views.UserViewSet)
router.register(r"groups", views.GroupViewSet)
router.register(r"product_category", views.ProductCategoryViewSet)
router.register(r"product", views.ProductViewSet)
router.register(r"factory", views.FactoryViewSet)
router.register(r"factory_user", views.FactoryUserViewSet)
router.register(r"factory_products", views.FactoryProductsViewSet)
router.register(r"factory_warehouse", views.FactoryWarehouseViewSet)
router.register(
    r"register-user", views.UniversalUserRegistrationViewSet, basename="register-user"
)
router.register(r"product_order", views.ProductOrderViewSet)
router.register(r"sale_point", views.SalePointViewSet)
router.register(r"sale_point_product_order", views.SalePointProductOrderViewSet)
router.register(r"sale_point_user", views.SalePointUserViewSet)
router.register(r"carrier", views.CarrierViewSet)
router.register(r"carrier_user", views.CarrierUserViewSet)
router.register(r"delivery", views.DeliveryViewSet)
router.register(r"product_order_delivery", views.ProductOrderDeliveryViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path("", include(router.urls)),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    path("api-token-auth/", obtain_auth_token, name="api_token_auth"),
    path("user-info/", views.UserInfoView.as_view(), name="user-info"),
]
