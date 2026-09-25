from django.urls import path

from .views import (
    WishlistView,
    WishlistAddView,
    WishlistRemoveView,
)

urlpatterns = [
    path("", WishlistView.as_view()),
    path("add/", WishlistAddView.as_view()),
    path("remove/<int:book_id>/", WishlistRemoveView.as_view()),
]