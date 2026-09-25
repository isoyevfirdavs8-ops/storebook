
from django.contrib import admin
from django.urls import path, include
from apps.payments.click import ClickPrepareView, ClickCompleteView
from apps.payments.payme import PaymeView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path(
    "api/auth/token/refresh/",TokenRefreshView.as_view(),name="token_refresh",),
    path('api/auth/', include('apps.users.urls')),
    path('api/', include('apps.books.urls')),
    path('api/', include('apps.orders.urls')),
    path("api/wishlist/", include("apps.wishlist.urls")),
]


urlpatterns += [
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]



urlpatterns += [
    path('payments/click/prepare/', ClickPrepareView.as_view()),
    path('payments/click/complete/', ClickCompleteView.as_view()),
    path('payments/payme/', PaymeView.as_view()),
]