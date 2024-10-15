from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet, PostViewSet, CommentViewSet, LikePostViewSet, FollowersCountViewSet, FriendshipViewSet, ChatViewSet, MessageViewSet

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet)
router.register(r'posts', PostViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'likeposts', LikePostViewSet)
router.register(r'followerscount', FollowersCountViewSet)
router.register(r'friendship', FriendshipViewSet)
router.register(r'chat', ChatViewSet)
router.register(r'message', MessageViewSet)

urlpatterns = [
    path('', include(router.urls)), #include all the urls from the router
]


