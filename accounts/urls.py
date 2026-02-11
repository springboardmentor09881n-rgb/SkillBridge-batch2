from django.urls import path
from django.http import JsonResponse
from .views import RegisterView, ProfileView

def api_root(request):
    return JsonResponse({"message": "Welcome to SkillBridge API!"})

urlpatterns = [
    path('', api_root, name='api-root'),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),  
]
