from rest_framework import generics, permissions
from drf_spectacular.utils import extend_schema
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    @extend_schema(tags=['Auth'], summary="Ro'yxatdan o'tish")
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class TaggedTokenObtainPairView(TokenObtainPairView):
    @extend_schema(tags=['Auth'], summary="Login (JWT token olish)")
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)