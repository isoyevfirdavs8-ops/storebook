from rest_framework import serializers
from .models import Book, Author, Category, Publisher


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'full_name', 'bio', 'photo']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent']


class BookListSerializer(serializers.ModelSerializer):
    authors = serializers.StringRelatedField(many=True)
    in_stock = serializers.ReadOnlyField()
    current_price = serializers.ReadOnlyField()

    class Meta:
        model = Book
        fields = ['id', 'title', 'slug', 'authors', 'cover_image', 'price', 'discount_price', 'current_price', 'in_stock']

class BookDetailSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    publisher_name = serializers.CharField(source='publisher.name', read_only=True)
    in_stock = serializers.ReadOnlyField()

    class Meta:
        model = Book
        fields = '__all__'