from rest_framework import generics, permissions, status
from rest_framework.response import Response

from drf_spectacular.utils import extend_schema

from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    RegisterSerializer,
    VerifyOTPSerializer,
    ResendOTPSerializer,
    CustomTokenObtainPairSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [
        permissions.AllowAny
    ]

    @extend_schema(
        tags=["Auth"],
        summary="Ro'yxatdan o'tish"
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()

        return Response(
            {
                "message": (
                    "Ro'yxatdan o'tish muvaffaqiyatli. "
                    "OTP yuborildi."
                ),
                "phone_number": user.phone_number,
                "is_phone_verified": user.is_phone_verified,
            },
            status=status.HTTP_201_CREATED
        )


class VerifyOTPView(generics.GenericAPIView):
    serializer_class = VerifyOTPSerializer
    permission_classes = [
        permissions.AllowAny
    ]

    @extend_schema(
        tags=["Auth"],
        summary="Telefon raqamini OTP orqali tasdiqlash"
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        return Response(
            {
                "message": "Telefon raqami muvaffaqiyatli tasdiqlandi.",
                "phone_number": serializer.validated_data[
                    "phone_number"
                ],
                "is_phone_verified": True,
            },
            status=status.HTTP_200_OK
        )


class ResendOTPView(generics.GenericAPIView):
    serializer_class = ResendOTPSerializer
    permission_classes = [
        permissions.AllowAny
    ]

    @extend_schema(
        tags=["Auth"],
        summary="OTPni qayta yuborish"
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            {
                "message": "Yangi OTP yuborildi."
            },
            status=status.HTTP_200_OK
        )


class TaggedTokenObtainPairView(
    TokenObtainPairView
):
    serializer_class = CustomTokenObtainPairSerializer

    @extend_schema(
        tags=["Auth"],
        summary="Login (JWT token olish)"
    )
    def post(self, request, *args, **kwargs):
        return super().post(
            request,
            *args,
            **kwargs
        )