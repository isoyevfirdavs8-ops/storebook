from rest_framework import serializers

from apps.books.models import Book
from .models import Wishlist


class WishlistBookSerializer(serializers.ModelSerializer):
    authors = serializers.StringRelatedField(many=True)

    class Meta:
        model = Book
        fields = [
            "id",
            "title",
            "slug",
            "authors",
            "price",
            "discount_price",
            "current_price",
            "cover_image",
            "stock",
            "in_stock",
        ]


class WishlistSerializer(serializers.ModelSerializer):
    books = WishlistBookSerializer(many=True, read_only=True)

    class Meta:
        model = Wishlist
        fields = [
            "id",
            "books",
            "created_at",
        ]