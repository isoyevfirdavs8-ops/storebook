import base64
from django.conf import settings
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.orders.models import Payment


class PaymeError:
    INVALID_AMOUNT = -31001
    ORDER_NOT_FOUND = -31050
    TRANSACTION_NOT_FOUND = -31003
    ALREADY_PAID = -31051
    CANT_CANCEL = -31007
    UNAUTHORIZED = -32504


class PaymeView(APIView):
    permission_classes = []
    @extend_schema(tags=['Payments'], summary="Payme JSON-RPC")


    def post(self, request):
        # Payme so'rovni Basic Auth orqali autentifikatsiya qiladi
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not self._check_auth(auth_header):
            return self._error(request.data.get('id'), PaymeError.UNAUTHORIZED, "Ruxsat yo'q")

        method = request.data.get('method')
        params = request.data.get('params', {})
        req_id = request.data.get('id')

        handler = getattr(self, f"_{method}", None)
        if not handler:
            return self._error(req_id, -32601, "Metod topilmadi")

        return handler(req_id, params)

    def _check_auth(self, auth_header):
        try:
            encoded = auth_header.split(' ')[1]
            decoded = base64.b64decode(encoded).decode()
            login, password = decoded.split(':')
            return login == 'Paycom' and password == settings.PAYME_KEY
        except Exception:
            return False

    def _error(self, req_id, code, message):
        return Response({
            "jsonrpc": "2.0", "id": req_id,
            "error": {"code": code, "message": message}
        })

    def _result(self, req_id, result):
        return Response({"jsonrpc": "2.0", "id": req_id, "result": result})

    # --- Payme metodlari ---

    def _CheckPerformTransaction(self, req_id, params):
        order_id = params.get('account', {}).get('order_id')
        amount = params.get('amount')  # tiyin (so'm x 100)

        payment = Payment.objects.filter(order_id=order_id, provider='payme').first()
        if not payment:
            return self._error(req_id, PaymeError.ORDER_NOT_FOUND, "Buyurtma topilmadi")

        if int(payment.amount * 100) != amount:
            return self._error(req_id, PaymeError.INVALID_AMOUNT, "Summa mos emas")

        return self._result(req_id, {"allow": True})

    def _CreateTransaction(self, req_id, params):
        order_id = params.get('account', {}).get('order_id')
        payme_trans_id = params.get('id')
        amount = params.get('amount')

        payment = Payment.objects.filter(order_id=order_id, provider='payme').first()
        if not payment:
            return self._error(req_id, PaymeError.ORDER_NOT_FOUND, "Buyurtma topilmadi")

        if payment.status == 'paid':
            return self._error(req_id, PaymeError.ALREADY_PAID, "Allaqachon to'langan")

        payment.transaction_id = payme_trans_id
        payment.status = 'pending'
        payment.save()

        return self._result(req_id, {
            "create_time": int(timezone.now().timestamp() * 1000),
            "transaction": str(payment.id),
            "state": 1,
        })

    def _PerformTransaction(self, req_id, params):
        payme_trans_id = params.get('id')
        payment = Payment.objects.filter(transaction_id=payme_trans_id).first()

        if not payment:
            return self._error(req_id, PaymeError.TRANSACTION_NOT_FOUND, "Tranzaksiya topilmadi")

        if payment.status != 'paid':
            payment.status = 'paid'
            payment.paid_at = timezone.now()
            payment.save()

            payment.order.status = 'confirmed'
            payment.order.save()

        return self._result(req_id, {
            "transaction": str(payment.id),
            "perform_time": int(payment.paid_at.timestamp() * 1000),
            "state": 2,
        })

    def _CancelTransaction(self, req_id, params):
        payme_trans_id = params.get('id')
        payment = Payment.objects.filter(transaction_id=payme_trans_id).first()

        if not payment:
            return self._error(req_id, PaymeError.TRANSACTION_NOT_FOUND, "Tranzaksiya topilmadi")

        payment.status = 'cancelled'
        payment.save()

        return self._result(req_id, {
            "transaction": str(payment.id),
            "cancel_time": int(timezone.now().timestamp() * 1000),
            "state": -1,
        })

    def _CheckTransaction(self, req_id, params):
        payme_trans_id = params.get('id')
        payment = Payment.objects.filter(transaction_id=payme_trans_id).first()

        if not payment:
            return self._error(req_id, PaymeError.TRANSACTION_NOT_FOUND, "Tranzaksiya topilmadi")

        state_map = {'pending': 1, 'paid': 2, 'cancelled': -1, 'failed': -2}

        return self._result(req_id, {
            "create_time": int(payment.created_at.timestamp() * 1000),
            "perform_time": int(payment.paid_at.timestamp() * 1000) if payment.paid_at else 0,
            "cancel_time": 0,
            "transaction": str(payment.id),
            "state": state_map.get(payment.status, 1),
        })