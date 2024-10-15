from django.utils import timezone # type: ignore
from django.db import models # type: ignore
from django.contrib.auth.models import AbstractUser # type: ignore
from django.conf import settings # type: ignore
# Create your models here.

class User(AbstractUser):
    bio = models.TextField(blank=True)
    profileimg = models.ImageField(upload_to='profile_images', default='blank-profile-picture.png')
    location = models.CharField(max_length=100, blank=True)
    birth_date = models.DateField(null=True, blank=True, default=timezone.now)
    following = models.ManyToManyField('self', related_name='followers', symmetrical=False, blank=True)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)


class Post(models.Model):
    id = models.AutoField(primary_key=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='post_images', default='blank-profile-picture.png')
    caption = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.IntegerField(default=0)

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

class LikePost(models.Model):
    post_id = models.CharField(max_length=500)
    username = models.CharField(max_length=100)

class FollowersCount(models.Model):
    follower = models.CharField(max_length=100)
    user = models.CharField(max_length=100)

    def __str__(self):
        return self.user
    
class FriendRequest(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_friend_requests')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_friend_requests')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')], default='pending')

    class Meta:
        unique_together = [('sender', 'receiver')]
        ordering = ['-created_at']

    def __str__(self):
        return self.sender
    
class Friendship(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_friendships')
    friend = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='friend_friendships')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_accepted = models.BooleanField(default=False)

    def __str__(self):
        return self.user
    
    class Meta:
        unique_together = [('user', 'friend')]
        ordering = ['-created_at']
    
class Chat(models.Model):
    user1 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user1_chats')
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user2_chats')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user1
    
class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.sender

