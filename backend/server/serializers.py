from rest_framework import serializers # type: ignore
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer # type: ignore
from .models import FriendRequest, Post, Comment, LikePost, FollowersCount, Friendship, Chat, Message, User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'password', 'profileimg', 'bio', 'location', 'birth_date', 'following', 'friends']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        return token

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'author', 'image', 'caption', 'created_at', 'updated_at', 'likes']

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    post = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all())
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at', 'updated_at']

class LikePostSerializer(serializers.ModelSerializer):
    class Meta:
        model = LikePost
        fields = ['id', 'post_id', 'username']

class FollowersCountSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowersCount
        fields = ['id', 'follower', 'user']

class FriendshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friendship
        fields = ['id', 'user', 'friend', 'created_at', 'updated_at', 'is_accepted']


class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id', 'user1', 'user2', 'created_at', 'updated_at']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender', 'receiver', 'content', 'created_at', 'updated_at']


class FriendRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'receiver', 'created_at', 'updated_at', 'status']

    def create(self, validated_data):
        friend_request = FriendRequest.objects.create(**validated_data)
        return friend_request
