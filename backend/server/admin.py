from django.contrib import admin # type: ignore
from .models import User, FriendRequest, Post, Comment, LikePost, FollowersCount, Friendship, Chat, Message
# Register your models here.

admin.site.register(User)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(LikePost)
admin.site.register(FollowersCount)
admin.site.register(Friendship)
admin.site.register(Chat)
admin.site.register(Message)
admin.site.register(FriendRequest)

