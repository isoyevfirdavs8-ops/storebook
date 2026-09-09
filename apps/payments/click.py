import hashlib
from django.conf import settings
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.orders.models import Payment


class ClickPrepareView(APIView):
    permission_classes = []
    @extend_schema(tags=['Payments'], summary="Click - Prepare")


    def post(self, request):
        data = request.data
        order_id = data.get('merchant_trans_id')
        amount = data.get('amount')
        sign_string = data.get('sign_string')

        # Signature tekshirish (Click hujjatidagi formuladan foydalaning)
        expected_sign = hashlib.md5(
            f"{data.get('click_trans_id')}{settings.CLICK_SERVICE_ID}"
            f"{settings.CLICK_SECRET_KEY}{order_id}{amount}"
            f"{data.get('action')}{data.get('sign_time')}".encode()
        ).hexdigest()

        if sign_string != expected_sign:
            return Response({"error": -1, "error_note": "Sign xato"})

        payment = Payment.objects.filter(order_id=order_id, provider='click').first()
        if not payment:
            return Response({"error": -5, "error_note": "Buyurtma topilmadi"})

        if float(payment.amount) != float(amount):
            return Response({"error": -2, "error_note": "Summa mos emas"})

        return Response({
            "click_trans_id": data.get('click_trans_id'),
            "merchant_trans_id": order_id,
            "merchant_prepare_id": payment.id,
            "error": 0,
            "error_note": "Success"
        })


class ClickCompleteView(APIView):
    permission_classes = []
    @extend_schema(tags=['Payments'], summary="Click - Complete")


    def post(self, request):
        data = request.data
        order_id = data.get('merchant_trans_id')
        error = int(data.get('error', 0))

        payment = Payment.objects.filter(order_id=order_id, provider='click').first()
        if not payment:
            return Response({"error": -5, "error_note": "Topilmadi"})

        if error == 0:
            payment.status = 'paid'
            payment.transaction_id = data.get('click_trans_id')
            payment.paid_at = timezone.now()
            payment.save()

            payment.order.status = 'confirmed'
            payment.order.save()
        else:
            payment.status = 'failed'
            payment.save()

        return Response({
            "click_trans_id": data.get('click_trans_id'),
            "merchant_trans_id": order_id,
            "error": 0,
            "error_note": "Success"
        })