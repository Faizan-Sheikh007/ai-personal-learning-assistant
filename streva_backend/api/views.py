from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import login, logout
from django.db.models import Sum
from .models import (
    User, Category, Course, Chapter, ChapterContent,
    Enrollment, Module, Lesson,
    Quiz, QuizAttempt, Badge, UserBadge, UploadedFile,
    LearningActivity, AIMessage, Review
)
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, UserUpdateSerializer,
    CategorySerializer, CourseSerializer, CourseListSerializer,
    ChapterSerializer, ChapterListSerializer,
    ChapterContentSerializer, ChapterContentCreateSerializer,
    EnrollmentSerializer, QuizSerializer, QuizPublicSerializer,
    QuizAttemptSerializer, BadgeSerializer, UploadedFileSerializer,
    LearningActivitySerializer, AIMessageSerializer, ReviewSerializer,
)
import os


# ─── AUTH VIEWS ───────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = LoginSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
        })


class LogoutView(APIView):
    def post(self, request):
        request.user.auth_token.delete()
        return Response({'detail': 'Logged out.'})


# ─── USER ─────────────────────────────────────────────────────────────────────

class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        ser = UserUpdateSerializer(request.user, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(UserSerializer(request.user).data)


class DashboardStatsView(APIView):
    def get(self, request):
        user = request.user
        enrollments = Enrollment.objects.filter(user=user)
        completed = enrollments.filter(status='completed').count()
        in_progress = enrollments.filter(status='in-progress').count()
        total_minutes = LearningActivity.objects.filter(user=user).aggregate(
            total=Sum('minutes_studied')
        )['total'] or 0
        attempts = QuizAttempt.objects.filter(user=user)
        correct = attempts.filter(is_correct=True).count()
        avg_score = round((correct / attempts.count() * 100) if attempts.count() else 0)

        from datetime import date, timedelta
        today = date.today()
        week = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            act = LearningActivity.objects.filter(user=user, date=d).first()
            week.append({
                'date': d.isoformat(),
                'day': d.strftime('%a'),
                'minutes': act.minutes_studied if act else 0,
            })

        return Response({
            'xp': user.xp,
            'level': user.level,
            'streak': user.streak,
            'enrolled_courses': enrollments.count(),
            'completed_courses': completed,
            'in_progress_courses': in_progress,
            'total_hours_learned': round(total_minutes / 60, 1),
            'avg_quiz_score': avg_score,
            'badges_count': user.user_badges.count(),
            'weekly_activity': week,
        })


# ─── COURSES ──────────────────────────────────────────────────────────────────

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.select_related('category').all()

    def get_serializer_class(self):
        if self.action in ['list']:
            return CourseListSerializer
        return CourseSerializer

    def get_permissions(self):
        # Allow any authenticated user to create/update courses
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        cat = self.request.query_params.get('category')
        level = self.request.query_params.get('level')
        search = self.request.query_params.get('search')
        if cat:
            qs = qs.filter(category__key=cat)
        if level:
            qs = qs.filter(level=level)
        if search:
            qs = qs.filter(title__icontains=search)
        return qs

    @action(detail=True, methods=['get'])
    def with_enrollment(self, request, pk=None):
        """Returns course + current user's enrollment status."""
        course = self.get_object()
        data = CourseSerializer(course, context={'request': request}).data
        enrollment = Enrollment.objects.filter(user=request.user, course=course).first()
        data['enrollment'] = EnrollmentSerializer(enrollment).data if enrollment else None
        return Response(data)

    @action(detail=True, methods=['get'])
    def full_content(self, request, pk=None):
        """Returns course with all chapters and their content (for Continue Learning)."""
        course = self.get_object()
        chapters = Chapter.objects.filter(course=course).prefetch_related('contents', 'quizzes')
        enrollment = Enrollment.objects.filter(user=request.user, course=course).first()

        chapters_data = []
        for ch in chapters:
            contents = ChapterContentSerializer(ch.contents.all(), many=True, context={'request': request}).data
            quizzes = QuizPublicSerializer(ch.quizzes.all(), many=True).data
            chapters_data.append({
                'id': ch.id,
                'title': ch.title,
                'description': ch.description,
                'order': ch.order,
                'contents': contents,
                'quizzes': quizzes,
            })

        return Response({
            'id': course.id,
            'title': course.title,
            'description': course.description,
            'instructor': course.instructor,
            'chapters': chapters_data,
            'enrollment': EnrollmentSerializer(enrollment).data if enrollment else None,
        })


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# ─── CHAPTERS ─────────────────────────────────────────────────────────────────

class ChapterViewSet(viewsets.ModelViewSet):
    """CRUD for chapters within a course."""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return ChapterListSerializer
        return ChapterSerializer

    def get_queryset(self):
        qs = Chapter.objects.prefetch_related('contents', 'quizzes')
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs

    def perform_create(self, serializer):
        serializer.save()


# ─── CHAPTER CONTENT ──────────────────────────────────────────────────────────

class ChapterContentViewSet(viewsets.ModelViewSet):
    """CRUD for content items within a chapter. Supports file uploads."""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method in ['POST', 'PUT', 'PATCH']:
            return ChapterContentCreateSerializer
        return ChapterContentSerializer

    def get_queryset(self):
        qs = ChapterContent.objects.all()
        chapter_id = self.request.query_params.get('chapter')
        if chapter_id:
            qs = qs.filter(chapter_id=chapter_id)
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


# ─── ENROLLMENTS ──────────────────────────────────────────────────────────────

class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user).select_related('course', 'course__category')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['patch'])
    def update_progress(self, request, pk=None):
        enrollment = self.get_object()
        progress = request.data.get('progress', enrollment.progress)
        enrollment.progress = max(0, min(100, int(progress)))
        if enrollment.progress == 100:
            enrollment.status = 'completed'
        elif enrollment.progress > 0:
            enrollment.status = 'in-progress'
        enrollment.save()
        return Response(EnrollmentSerializer(enrollment).data)

    @action(detail=True, methods=['patch'])
    def mark_content(self, request, pk=None):
        """Mark a content item as completed and recalculate progress."""
        enrollment = self.get_object()
        content_id = request.data.get('content_id')
        if content_id is None:
            return Response({'error': 'content_id required'}, status=400)

        completed = list(enrollment.completed_content_ids or [])
        if content_id not in completed:
            completed.append(content_id)
        enrollment.completed_content_ids = completed

        # Auto-calculate progress based on total content in course
        total_content = ChapterContent.objects.filter(chapter__course=enrollment.course).count()
        if total_content > 0:
            pct = int(len(completed) / total_content * 100)
            enrollment.progress = min(100, pct)
            if enrollment.progress == 100:
                enrollment.status = 'completed'
            elif enrollment.progress > 0:
                enrollment.status = 'in-progress'

        enrollment.save()
        return Response(EnrollmentSerializer(enrollment).data)


# ─── QUIZ ─────────────────────────────────────────────────────────────────────

class QuizViewSet(viewsets.ModelViewSet):
    """Full CRUD so instructors can create/edit quizzes."""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        # Return full serializer with correct_answer for create/update
        if self.request.method in ['POST', 'PUT', 'PATCH']:
            return QuizSerializer
        return QuizPublicSerializer

    def get_queryset(self):
        qs = Quiz.objects.all()
        course_id = self.request.query_params.get('course')
        chapter_id = self.request.query_params.get('chapter')
        if course_id:
            qs = qs.filter(course_id=course_id)
        if chapter_id:
            qs = qs.filter(chapter_id=chapter_id)
        return qs


class QuizAttemptView(generics.CreateAPIView):
    serializer_class = QuizAttemptSerializer

    def perform_create(self, serializer):
        attempt = serializer.save(user=self.request.user)
        if attempt.is_correct:
            self.request.user.xp += 10
            self.request.user.save(update_fields=['xp'])


class QuizHistoryView(generics.ListAPIView):
    serializer_class = QuizAttemptSerializer

    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user).select_related('quiz').order_by('-attempted_at')


# ─── BADGES ───────────────────────────────────────────────────────────────────

class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer


class AwardBadgeView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, badge_id):
        badge = Badge.objects.get(pk=badge_id)
        user_id = request.data.get('user_id', request.user.id)
        user = User.objects.get(pk=user_id)
        ub, created = UserBadge.objects.get_or_create(user=user, badge=badge)
        if created:
            user.xp += badge.xp_reward
            user.save(update_fields=['xp'])
        return Response({'awarded': created, 'badge': badge.name})


# ─── FILE UPLOAD ──────────────────────────────────────────────────────────────

class UploadedFileViewSet(viewsets.ModelViewSet):
    serializer_class = UploadedFileSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return UploadedFile.objects.filter(user=self.request.user).order_by('-uploaded_at')

    def perform_create(self, serializer):
        uploaded = self.request.FILES.get('file')
        url = self.request.data.get('url', '')
        name = self.request.data.get('name', uploaded.name if uploaded else url)
        size_bytes = uploaded.size if uploaded else 0
        size_str = self._fmt_size(size_bytes)
        file_type = self._detect_type(name, url)
        serializer.save(
            user=self.request.user,
            name=name,
            size=size_str,
            file_type=file_type,
            url=url,
        )

    @staticmethod
    def _fmt_size(b):
        if b < 1024: return f"{b} B"
        if b < 1024 ** 2: return f"{b/1024:.1f} KB"
        return f"{b/(1024**2):.1f} MB"

    @staticmethod
    def _detect_type(name, url):
        ext = (name or url).rsplit('.', 1)[-1].lower()
        if ext in ['mp4', 'mov', 'avi', 'webm']: return 'video'
        if ext == 'pdf': return 'pdf'
        if ext in ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp']: return 'image'
        if ext in ['txt', 'md', 'doc', 'docx']: return 'text'
        if url: return 'link'
        return 'default'


# ─── LEARNING ACTIVITY ────────────────────────────────────────────────────────

class LearningActivityView(generics.ListCreateAPIView):
    serializer_class = LearningActivitySerializer

    def get_queryset(self):
        return LearningActivity.objects.filter(user=self.request.user)[:30]

    def perform_create(self, serializer):
        from datetime import date
        today = date.today()
        act, _ = LearningActivity.objects.get_or_create(user=self.request.user, date=today)
        minutes = serializer.validated_data.get('minutes_studied', 0)
        act.minutes_studied += minutes
        act.save()


# ─── AI CHAT ──────────────────────────────────────────────────────────────────

class AIChatView(generics.ListCreateAPIView):
    serializer_class = AIMessageSerializer

    def get_queryset(self):
        return AIMessage.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'error': 'text required'}, status=400)

        AIMessage.objects.create(user=request.user, role='user', text=text)
        ai_text = self._get_reply(text)
        ai_msg = AIMessage.objects.create(user=request.user, role='ai', text=ai_text)

        return Response(AIMessageSerializer(ai_msg).data, status=status.HTTP_201_CREATED)

    @staticmethod
    def _get_reply(msg):
        lower = msg.lower()
        if 'osi' in lower:
            return ('The OSI Model has 7 layers: Physical (1), Data Link (2), Network (3), '
                    'Transport (4), Session (5), Presentation (6), Application (7). '
                    'Remember: "Please Do Not Throw Sausage Pizza Away" 🍕')
        if 'mitm' in lower or 'man in the' in lower:
            return ('A Man-in-the-Middle (MITM) attack occurs when an attacker secretly intercepts '
                    'communication between two parties. Prevention: Use HTTPS, HSTS, certificate pinning, and VPNs.')
        if 'aes' in lower or 'encrypt' in lower:
            return ('AES (Advanced Encryption Standard) uses a symmetric key algorithm with block sizes '
                    'of 128 bits and key sizes of 128, 192, or 256 bits.')
        if 'quiz' in lower:
            return ('📝 Quick question: What does "CIA" stand for in information security?\n\n'
                    'A) Confidentiality, Integrity, Availability ✓\nB) Central Intelligence Agency\n'
                    'C) Cipher, Intrusion, Authentication\n\nAnswer: A! The CIA Triad is the foundation of InfoSec.')
        return (f'Great question about "{msg}"! I recommend checking your enrolled courses for related material. '
                'Would you like me to generate practice questions on this topic? 🤖')


# ─── REVIEWS ──────────────────────────────────────────────────────────────────

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        course_id = self.request.query_params.get('course')
        qs = Review.objects.select_related('user')
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
