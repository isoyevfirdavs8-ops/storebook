from drf_spectacular.utils import extend_schema
from rest_framework.generics import ListAPIView
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, OrderSerializer
from apps.books.models import Book
from .tasks import send_order_notification
from rest_framework import generics, status

class CartView(APIView):

    permission_classes = [IsAuthenticated]
    @extend_schema(tags=['Cart'], summary="Savatchani ko'rish")


    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return Response(CartSerializer(cart).data)


class CartAddItemView(APIView):

    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Cart'], summary="Savatga kitob qo'shish")

    def post(self, request):
        book_id = request.data.get('book_id')
        quantity = int(request.data.get('quantity', 1))

        book = Book.objects.filter(id=book_id, is_active=True).first()
        if not book:
            return Response({"detail": "Kitob topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        if book.stock < quantity:
            return Response({"detail": "Omborda yetarli mahsulot yo'q"}, status=status.HTTP_400_BAD_REQUEST)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        item, created = CartItem.objects.get_or_create(cart=cart, book=book, defaults={'quantity': quantity})

        if not created:
            item.quantity += quantity
            item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartRemoveItemView(APIView):

    permission_classes = [IsAuthenticated]
    @extend_schema(tags=['Cart'], summary="Savatdan o'chirish")


    def delete(self, request, item_id):
        CartItem.objects.filter(id=item_id, cart__user=request.user).delete()
        cart = Cart.objects.get(user=request.user)
        return Response(CartSerializer(cart).data)


class CheckoutView(APIView):


    permission_classes = [IsAuthenticated]
    @extend_schema(tags=['Orders'], summary="Buyurtma berish")


    @transaction.atomic
    def post(self, request):
        delivery_address = request.data.get('delivery_address')
        if not delivery_address:
            return Response({"detail": "Yetkazib berish manzili kerak"}, status=status.HTTP_400_BAD_REQUEST)

        cart = Cart.objects.filter(user=request.user).first()
        if not cart or not cart.items.exists():
            return Response({"detail": "Savatcha bo'sh"}, status=status.HTTP_400_BAD_REQUEST)


        for item in cart.items.all():
            if item.book.stock < item.quantity:
                return Response(
                    {"detail": f"'{item.book.title}' uchun yetarli zaxira yo'q"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        order = Order.objects.create(
            user=request.user,
            delivery_address=delivery_address,
            total_price=cart.total_price
        )

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order, book=item.book,
                quantity=item.quantity, price=item.book.current_price
            )
            item.book.stock -= item.quantity
            item.book.save()

        cart.items.all().delete()
        send_order_notification.delay(order.id)

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class MyOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    @extend_schema(tags=['Orders'], summary="Mening buyurtmalarim")


    def get_queryset(self):
        return self.request.user.orders.order_by('-created_at')




class MyOrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Orders'],
        summary="Buyurtma tafsilotlarini ko'rish"
    )
    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user
        ).prefetch_related(
            'items__book'
        )