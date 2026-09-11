from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .services import generate_otp, verify_otp

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User

        fields = [
            "email",
            "password",
            "full_name",
            "phone_number",
        ]

    def validate_phone_number(self, value):
        value = value.strip()

        if not value.startswith("+998"):
            raise serializers.ValidationError(
                "Telefon raqam +998 bilan boshlanishi kerak."
            )

        if len(value) != 13:
            raise serializers.ValidationError(
                "Telefon raqam noto'g'ri formatda."
            )

        return value

    def validate_email(self, value):
        if value:
            value = value.lower().strip()

        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            **validated_data
        )

        generate_otp(
            user.phone_number
        )

        return user


class VerifyOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(
        max_length=13
    )

    code = serializers.CharField(
        max_length=6,
        min_length=6
    )

    def validate(self, attrs):
        success, message = verify_otp(
            attrs["phone_number"],
            attrs["code"]
        )

        if not success:
            raise serializers.ValidationError({
                "code": message
            })

        return attrs


class ResendOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(
        max_length=13
    )

    def validate_phone_number(self, value):
        try:
            User.objects.get(
                phone_number=value
            )
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "Bunday foydalanuvchi mavjud emas."
            )

        return value

    def save(self):
        return generate_otp(
            self.validated_data["phone_number"]
        )


class CustomTokenObtainPairSerializer(
    TokenObtainPairSerializer
):
    def validate(self, attrs):
        data = super().validate(attrs)

        if not self.user.is_phone_verified:
            raise serializers.ValidationError({
                "phone_number": (
                    "Telefon raqami tasdiqlanmagan. "
                    "Avval OTP orqali tasdiqlang."
                )
            })

        data["user"] = {
            "id": self.user.id,
            "phone_number": self.user.phone_number,
            "email": self.user.email,
            "full_name": self.user.full_name,
        }

        return data