from django.contrib import admin # type: ignore
from .models import Profile, Post, Comment, DirectMessage
# Register your models here.

admin.site.register(Profile)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(DirectMessage)