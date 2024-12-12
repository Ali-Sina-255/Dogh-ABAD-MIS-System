from django.contrib import admin

from .models import BlogPost, Category, Order, PostCategory, Reception

admin.site.register(Category)
admin.site.register(Order)
admin.site.register(Reception)
admin.site.register(BlogPost)
admin.site.register(PostCategory)