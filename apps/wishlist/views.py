from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.books.models import Book

from .models import Wishlist
from .serializers import WishlistSerializer


class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(
            user=request.user
        )

        wishlist.books.all()

        return Response(
            WishlistSerializer(wishlist).data
        )


class WishlistAddView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        book_id = request.data.get("book_id")

        if not book_id:
            return Response(
                {"detail": "book_id kerak"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        book = Book.objects.filter(
            id=book_id,
            is_active=True,
        ).first()

        if not book:
            return Response(
                {"detail": "Kitob topilmadi"},
                status=status.HTTP_404_NOT_FOUND,
            )

        wishlist, _ = Wishlist.objects.get_or_create(
            user=request.user
        )

        wishlist.books.add(book)

        return Response(
            WishlistSerializer(wishlist).data,
            status=status.HTTP_200_OK,
        )


class WishlistRemoveView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, book_id):
        wishlist = Wishlist.objects.filter(
            user=request.user
        ).first()

        if wishlist:
            wishlist.books.remove(book_id)

        return Response(
            WishlistSerializer(wishlist).data
            if wishlist
            else {"books": []}
        )