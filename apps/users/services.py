import random

from django.utils import timezone

from .models import PhoneOTP, User


def generate_otp(phone_number):
    # Eski ishlatilmagan OTPlarni o'chiramiz
    PhoneOTP.objects.filter(
        phone_number=phone_number,
        is_used=False
    ).delete()

    code = str(random.randint(100000, 999999))

    otp = PhoneOTP.objects.create(
        phone_number=phone_number,
        code=code
    )

    # Hozircha SMS servisi yo'q.
    # Development vaqtida terminalda ko'ramiz.
    print("=" * 50)
    print(f"OTP for {phone_number}: {code}")
    print("=" * 50)

    return otp


def verify_otp(phone_number, code):
    otp = (
        PhoneOTP.objects
        .filter(
            phone_number=phone_number,
            is_used=False
        )
        .order_by("-created_at")
        .first()
    )

    if not otp:
        return False, "OTP topilmadi"

    if otp.is_expired():
        return False, "OTP muddati tugagan"

    if otp.attempts >= 5:
        return False, "Juda ko'p noto'g'ri urinish"

    if otp.code != str(code):
        otp.attempts += 1
        otp.save(update_fields=["attempts"])

        return False, "OTP noto'g'ri"

    otp.is_used = True
    otp.save(update_fields=["is_used"])

    try:
        user = User.objects.get(
            phone_number=phone_number
        )
    except User.DoesNotExist:
        return False, "Foydalanuvchi topilmadi"

    user.is_phone_verified = True
    user.save(
        update_fields=["is_phone_verified"]
    )

    return True, "Telefon raqami tasdiqlandi"