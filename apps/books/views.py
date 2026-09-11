from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Book, Category, Author
from .serializers import BookListSerializer, BookDetailSerializer, CategorySerializer, AuthorSerializer
from drf_spectacular.utils import extend_schema,extend_schema_view
@extend_schema_view(
    list=extend_schema(tags=['Books']),
    retrieve=extend_schema(tags=['Books']),
    create=extend_schema(tags=['Books']),
    update=extend_schema(tags=['Books']),
    partial_update=extend_schema(tags=['Books']),
    destroy=extend_schema(tags=['Books']),
)
class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.filter(is_active=True).prefetch_related('authors', 'categories').select_related('publisher')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    filterset_fields = ['categories', 'authors', 'language', 'format']
    search_fields = ['title', 'isbn', 'authors__full_name']
    ordering_fields = ['price', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return BookListSerializer
        return BookDetailSerializer

@extend_schema_view(
    list=extend_schema(tags=['Categories']),
    retrieve=extend_schema(tags=['Categories']),
)
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

@extend_schema_view(
    list=extend_schema(tags=['Authors']),
    retrieve=extend_schema(tags=['Authors']),
)
class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer