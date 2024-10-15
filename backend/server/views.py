from rest_framework import filters # type: ignore
from rest_framework import generics, permissions, status, viewsets # type: ignore
from django_filters.rest_framework import DjangoFilterBackend # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework_simplejwt.views import TokenObtainPairView # type: ignore
from rest_framework.decorators import action # type: ignore
from .models import FriendRequest, Post, Comment, LikePost, FollowersCount, Friendship, Chat, Message, User
from .serializers import FriendRequestSerializer, UserSerializer, CustomTokenObtainPairSerializer, PostSerializer, CommentSerializer, LikePostSerializer, FollowersCountSerializer, FriendshipSerializer, ChatSerializer, MessageSerializer
from .permissions import IsOwnerOrReadOnly, IsFriendOrReadOnly # type: ignore

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['author', 'likes']
    search_fields = ['caption']
    ordering_fields = ['created_at']

    @action(detail=False, methods=['get'])
    def news_feed(self, request):
        user = request.user
        friends = user.friendships.values_list('friend', flat=True)
        following = user.following.all()
        posts = Post.objects.filter(author__in=friends).union(Post.objects.filter(author__in=following))
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CommentViewSet(viewsets.ModelViewSet):    
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class LikePostViewSet(viewsets.ModelViewSet):
    queryset = LikePost.objects.all()
    serializer_class = LikePostSerializer
    permission_classes = [permissions.IsAuthenticated, IsFriendOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(username=self.request.user.username)

class FollowersCountViewSet(viewsets.ModelViewSet):
    queryset = FollowersCount.objects.all()
    serializer_class = FollowersCountSerializer
    permission_classes = [permissions.IsAuthenticated, IsFriendOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(follower=self.request.user.username)

class FriendRequestViewSet(viewsets.ModelViewSet):
    queryset = FriendRequest.objects.all()
    serializer_class = FriendRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        friend_request = self.get_object()
        if friend_request.receiver == request.user and friend_request.status == 'pending':
            friend_request.status = 'accepted'
            friend_request.save()
            Friendship.objects.create(user=friend_request.sender, friend=friend_request.receiver)
            Friendship.objects.create(user=friend_request.receiver, friend=friend_request.sender)
            return Response({'status': 'friend request accepted'})
        else:
            return Response({'status': 'friend request not accepted'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        friend_request = self.get_object()
        if friend_request.receiver == request.user and friend_request.status == 'pending':
            friend_request.status = 'rejected'
            friend_request.save()
            return Response({'status': 'friend request rejected'})
        else:
            return Response({'status': 'friend request not rejected'})

class FriendshipViewSet(viewsets.ModelViewSet):
    queryset = Friendship.objects.all()
    serializer_class = FriendshipSerializer
    permission_classes = [permissions.IsAuthenticated, IsFriendOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        user = self.request.user
        return Friendship.objects.filter(user=self.request.user)

class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated, IsFriendOrReadOnly]

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated, IsFriendOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class SearchView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['username', 'first_name', 'last_name', 'email']
    search_fields = ['username', 'first_name', 'last_name', 'email']
    ordering_fields = ['username', 'first_name', 'last_name', 'email']