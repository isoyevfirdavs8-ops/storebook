
import random
from django.utils import timezone
from .models import PhoneOTP

def generate_otp(phone_number):
    code = str(random.randint(100000, 999999))
    PhoneOTP.objects.create(phone_number=phone_number, code=code)
    
    return code

def verify_otp(phone_number, code):
    otp = PhoneOTP.objects.filter(
        phone_number=phone_number, code=code, is_used=False
    ).order_by('-created_at').first()

    if not otp:
        return False, "Kod noto'g'ri"
    if otp.is_expired():
        return False, "Kod muddati o'tgan"

    otp.is_used = True
    otp.save()
    return True, "Tasdiqlandi"