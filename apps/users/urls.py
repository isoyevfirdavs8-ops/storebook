from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, TaggedTokenObtainPairView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', TaggedTokenObtainPairView.as_view()),
    path('login/refresh/', TokenRefreshView.as_view()),
]