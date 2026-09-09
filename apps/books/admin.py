from django.contrib import admin
from .models import Book, Author, Category, Publisher


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ['full_name']
    search_fields = ['full_name']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(Publisher)
class PublisherAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'publisher', 'price', 'discount_price', 'stock', 'is_active', 'created_at']
    list_filter = ['is_active', 'language', 'format', 'categories']
    search_fields = ['title', 'isbn']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['authors', 'categories']
    list_editable = ['price', 'stock', 'is_active']  # ro'yxatdan turib tez tahrirlash
    readonly_fields = ['created_at', 'updated_at']