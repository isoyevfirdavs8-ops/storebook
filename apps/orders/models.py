from django.conf import settings
from django.db import models
from apps.books.models import Book


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', "Kutilmoqda"
        CONFIRMED = 'confirmed', "Tasdiqlangan"
        SHIPPED = 'shipped', "Yetkazilmoqda"
        DELIVERED = 'delivered', "Yetkazib berilgan"
        CANCELLED = 'cancelled', "Bekor qilingan"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)
    delivery_address = models.CharField(max_length=500)
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    book = models.ForeignKey(Book, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

from django.conf import settings
from django.db import models
from apps.books.models import Book


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def total_price(self):
        return sum(item.subtotal for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ['cart', 'book']  # bir xil kitob ikki marta qatorga tushmasin

    @property
    def subtotal(self):
        return self.book.current_price * self.quantity


class Payment(models.Model):
    class Provider(models.TextChoices):
        CLICK = 'click', "Click"
        PAYME = 'payme', "Payme"

    class Status(models.TextChoices):
        PENDING = 'pending', "Kutilmoqda"
        PAID = 'paid', "To'landi"
        FAILED = 'failed', "Muvaffaqiyatsiz"
        CANCELLED = 'cancelled', "Bekor qilingan"

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    provider = models.CharField(max_length=10, choices=Provider.choices)
    transaction_id = models.CharField(max_length=100, blank=True)  # provayder tomonidagi ID
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)