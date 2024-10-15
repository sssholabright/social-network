from rest_framework.routers import DefaultRouter # type: ignore
from django.urls import path, include # type: ignore
from rest_framework_simplejwt.views import TokenRefreshView # type: ignore
from .views import FriendRequestViewSet, RegisterView, CustomTokenObtainPairView, UserView, PostViewSet, CommentViewSet, LikePostViewSet, FollowersCountViewSet, FriendshipViewSet, ChatViewSet, MessageViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='posts')
router.register(r'comments', CommentViewSet, basename='comments')
router.register(r'likeposts', LikePostViewSet, basename='likeposts')
router.register(r'followerscount', FollowersCountViewSet, basename='followerscount')
router.register(r'friendships', FriendshipViewSet, basename='friendships')
router.register(r'chats', ChatViewSet, basename='chats')
router.register(r'messages', MessageViewSet, basename='messages')
router.register(r'friendrequests', FriendRequestViewSet, basename='friendrequests')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', UserView.as_view(), name='user')
]