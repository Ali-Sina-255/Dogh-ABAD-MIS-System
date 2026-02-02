from ckeditor_uploader.fields import RichTextUploadingField
from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from pyexpat import model


class Category(models.Model):
    name = models.CharField(_("Category Name :"), max_length=255)
    created_at = models.DateField(_("Category Created Date"), auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"


class Order(models.Model):
    Customer_name = models.CharField(_("Customer Name :"), max_length=255)
    order_name = models.CharField(_("Order Name : "), max_length=255)
    description = RichTextUploadingField()
    category = models.ManyToManyField(Category)
    created_at = models.DateField(_("Order Created Date"), auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.Customer_name


class Reception(models.Model):
    User = get_user_model()
    designer = models.ForeignKey(User, on_delete=models.CASCADE)
    customer_name = models.CharField(_("Customer Name"), max_length=255)
    order_name = models.CharField(_("Order Name "), max_length=255)
    description = RichTextUploadingField(_("Description"))
    total_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    receive_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    reminder_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    deliveryDate = models.DateField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.customer_name} - {self.designer.first_name}"


class PostCategory(models.Model):
    category_name = models.CharField(max_length=255)
    created_at = models.DateField(_("Category Created Date"), auto_now_add=True)

    def __str__(self) -> str:
        return self.category_name


class BlogPost(models.Model):
    title = models.CharField(max_length=255)
    category = models.ForeignKey(PostCategory, on_delete=models.CASCADE)
    image = models.ImageField(upload_to="media/blog/", null=True, blank=True)
    description = RichTextUploadingField()
    created_at = models.DateField(_("Blog Post Created Date"), auto_now_add=True)

    def __str__(self) -> str:
        return self.title
