from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuthViewSet, ProfileViewSet, PostViewSet, CommentViewSet, DirectMessageViewSet, GetCSRFToken

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'profiles', ProfileViewSet, basename='profiles')
router.register(r'posts', PostViewSet, basename='posts')
router.register(r'comments', CommentViewSet, basename='comments')
router.register(r'messages', DirectMessageViewSet, basename='messages')

urlpatterns = [
    path('', include(router.urls)),
    path('csrf/', GetCSRFToken.as_view(), name='csrf'),

]