from django.contrib import admin
from .models import Profile, Post, Comment, LikePost, FollowersCount, Friendship, Chat, Message
# Register your models here.

admin.site.register(Profile)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(LikePost)
admin.site.register(FollowersCount)
admin.site.register(Friendship)
admin.site.register(Chat)
admin.site.register(Message)


