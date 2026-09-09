import requests
from celery import shared_task
from django.conf import settings


@shared_task
def send_order_notification(order_id):
    from .models import Order

    order = Order.objects.select_related('user').prefetch_related('items__book').get(id=order_id)

    items_text = "\n".join(
        f"  • {item.book.title} x{item.quantity} — {item.price} so'm"
        for item in order.items.all()
    )

    message = (
        f"🆕 Yangi buyurtma #{order.id}\n"
        f"👤 Mijoz: {order.user.full_name} ({order.user.phone_number})\n"
        f"📍 Manzil: {order.delivery_address}\n"
        f"📚 Kitoblar:\n{items_text}\n"
        f"💰 Jami: {order.total_price} so'm"
    )

    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
    requests.post(url, data={
        'chat_id': settings.TELEGRAM_ADMIN_CHAT_ID,
        'text': message,
    })