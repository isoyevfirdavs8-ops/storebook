from django.db import models
from django.core.validators import MinValueValidator


class Author(models.Model):
    full_name = models.CharField(max_length=255)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to='authors/', blank=True, null=True)

    class Meta:
        ordering = ['full_name']

    def __str__(self):
        return self.full_name


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE,
        null=True, blank=True, related_name='children'
    )

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Publisher(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Book(models.Model):
    class Format(models.TextChoices):
        HARDCOVER = 'hardcover', "Qattiq muqova"
        PAPERBACK = 'paperback', "Yumshoq muqova"

    class Language(models.TextChoices):
        UZ = 'uz', "O'zbek"
        RU = 'ru', "Rus"
        EN = 'en', "Ingliz"

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    authors = models.ManyToManyField(Author, related_name='books')
    categories = models.ManyToManyField(Category, related_name='books')
    publisher = models.ForeignKey(
        Publisher, on_delete=models.SET_NULL, null=True, related_name='books'
    )

    isbn = models.CharField(max_length=13, unique=True)
    language = models.CharField(max_length=2, choices=Language.choices, default=Language.UZ)
    format = models.CharField(max_length=10, choices=Format.choices, default=Format.PAPERBACK)
    pages = models.PositiveIntegerField(default=0)

    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    discount_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0)]
    )

    cover_image = models.ImageField(upload_to='books/covers/')
    stock = models.PositiveIntegerField(default=0)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['isbn']),
        ]

    def __str__(self):
        return self.title

    @property
    def current_price(self):
        return self.discount_price if self.discount_price else self.price

    @property
    def in_stock(self):
        return self.stock > 0