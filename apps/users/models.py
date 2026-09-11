from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
import datetime


class UserManager(BaseUserManager):

    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError("Telefon raqam kiritilishi shart")

        user = self.model(
            phone_number=phone_number,
            **extra_fields
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_phone_verified", True)

        return self.create_user(
            phone_number,
            password,
            **extra_fields
        )


class User(AbstractBaseUser, PermissionsMixin):
    phone_number = models.CharField(
        max_length=13,
        unique=True
    )

    full_name = models.CharField(
        max_length=255,
        blank=True
    )

    email = models.EmailField(
        blank=True,
        null=True
    )

    is_phone_verified = models.BooleanField(
        default=False
    )

    is_active = models.BooleanField(
        default=True
    )

    is_staff = models.BooleanField(
        default=False
    )

    date_joined = models.DateTimeField(
        auto_now_add=True
    )

    objects = UserManager()

    USERNAME_FIELD = "phone_number"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.phone_number


class PhoneOTP(models.Model):
    phone_number = models.CharField(max_length=13)

    code = models.CharField(max_length=6)

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    is_used = models.BooleanField(
        default=False
    )

    attempts = models.PositiveSmallIntegerField(
        default=0
    )

    class Meta:
        indexes = [
            models.Index(
                fields=["phone_number"]
            )
        ]

    def is_expired(self):
        return timezone.now() > (
            self.created_at + datetime.timedelta(minutes=2)
        )

    def __str__(self):
        return f"{self.phone_number} - {self.code}"