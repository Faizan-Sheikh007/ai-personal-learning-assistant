from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('courses', views.CourseViewSet, basename='course')
router.register('categories', views.CategoryViewSet, basename='category')
router.register('chapters', views.ChapterViewSet, basename='chapter')
router.register('chapter-content', views.ChapterContentViewSet, basename='chapter-content')
router.register('enrollments', views.EnrollmentViewSet, basename='enrollment')
router.register('quizzes', views.QuizViewSet, basename='quiz')
router.register('badges', views.BadgeViewSet, basename='badge')
router.register('files', views.UploadedFileViewSet, basename='file')
router.register('reviews', views.ReviewViewSet, basename='review')

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),

    # User
    path('me/', views.MeView.as_view(), name='me'),
    path('dashboard/', views.DashboardStatsView.as_view(), name='dashboard'),

    # Quiz attempts
    path('quiz/attempt/', views.QuizAttemptView.as_view(), name='quiz-attempt'),
    path('quiz/history/', views.QuizHistoryView.as_view(), name='quiz-history'),

    # Badges (admin)
    path('badges/<int:badge_id>/award/', views.AwardBadgeView.as_view(), name='award-badge'),

    # Activity
    path('activity/', views.LearningActivityView.as_view(), name='activity'),

    # AI
    path('ai/chat/', views.AIChatView.as_view(), name='ai-chat'),

    # Router (courses, chapters, chapter-content, quizzes, enrollments, etc.)
    path('', include(router.urls)),
]
