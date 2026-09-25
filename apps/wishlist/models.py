from django.conf import settings
from django.db import models

from apps.books.models import Book


class Wishlist(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wishlist",
    )
    books = models.ManyToManyField(
        Book,
        related_name="wishlisted_by",
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} wishlist"