from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem, Payment


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['book', 'quantity', 'price']
    can_delete = False


class PaymentInline(admin.StackedInline):
    model = Payment
    extra = 0
    readonly_fields = ['provider', 'transaction_id', 'status', 'amount', 'paid_at']
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'total_price', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__email', 'user__full_name', 'delivery_address']
    list_editable = ['status']  # operator shu yerdan statusni "tasdiqlangan" qilib qo'yadi
    inlines = [OrderItemInline, PaymentInline]
    readonly_fields = ['total_price', 'created_at']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'book', 'quantity']