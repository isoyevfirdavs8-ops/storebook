from django.urls import path

from .views import (
    RegisterView,
    VerifyOTPView,
    ResendOTPView,
    TaggedTokenObtainPairView,
)


urlpatterns = [
    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),

    path(
        "verify-phone/",
        VerifyOTPView.as_view(),
        name="verify-phone"
    ),

    path(
        "resend-otp/",
        ResendOTPView.as_view(),
        name="resend-otp"
    ),

    path(
        "login/",
        TaggedTokenObtainPairView.as_view(),
        name="login"
    ),
]