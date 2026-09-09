from django.urls import path
from .views import CartView, CartAddItemView, CartRemoveItemView, CheckoutView, MyOrdersView

urlpatterns = [
    path('cart/', CartView.as_view()),
    path('cart/add/', CartAddItemView.as_view()),
    path('cart/remove/<int:item_id>/', CartRemoveItemView.as_view()),
    path('checkout/', CheckoutView.as_view()),
    path('orders/', MyOrdersView.as_view()),
]