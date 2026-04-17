from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import (
    User, Category, Course, Chapter, ChapterContent,
    Enrollment, Module, Lesson,
    Quiz, QuizAttempt, Badge, UserBadge, UploadedFile,
    LearningActivity, AIMessage, Review
)


# ─── AUTH ─────────────────────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    name = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True, default='')
    roll_number = serializers.CharField(required=False, allow_blank=True, default='')
    role = serializers.CharField(required=False, default='Student')

    class Meta:
        model = User
        fields = ['name', 'email', 'username', 'password', 'roll_number', 'role']

    def validate(self, data):
        # Run password validation but skip similarity check against username
        # (avoids 400 when password resembles username on short inputs)
        password = data.get('password', '')
        user = User(username=data.get('username', ''))
        try:
            validate_password(password, user)
        except DjangoValidationError as e:
            # Only raise for truly weak passwords, not similarity errors
            non_similarity_errors = [
                msg for msg in e.messages
                if 'similar' not in msg.lower()
            ]
            if non_similarity_errors:
                raise serializers.ValidationError({'password': non_similarity_errors})
        return data

    def create(self, validated_data):
        name = validated_data.pop('name', '')
        parts = name.strip().split(' ', 1)
        validated_data['first_name'] = parts[0]
        validated_data['last_name'] = parts[1] if len(parts) > 1 else ''
        # Auto-generate email if not provided
        if not validated_data.get('email'):
            validated_data['email'] = f"{validated_data['username']}@streva.ai"
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if not user:
            raise serializers.ValidationError('Invalid credentials.')
        return {'user': user}


# ─── USER ─────────────────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    badges_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'name', 'email', 'username', 'roll_number', 'role',
            'xp', 'level', 'daily_goal', 'streak', 'department',
            'avatar_initials', 'date_joined', 'badges_count',
        ]
        read_only_fields = ['id', 'date_joined', 'avatar_initials', 'badges_count']

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_badges_count(self, obj):
        return obj.user_badges.count()


class UserUpdateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ['name', 'email', 'roll_number', 'role', 'daily_goal', 'department']

    def update(self, instance, validated_data):
        name = validated_data.pop('name', None)
        if name:
            parts = name.strip().split(' ', 1)
            instance.first_name = parts[0]
            instance.last_name = parts[1] if len(parts) > 1 else ''
        return super().update(instance, validated_data)


# ─── CATEGORY ─────────────────────────────────────────────────────────────────

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'key', 'label', 'icon', 'color', 'pill_class']


# ─── CHAPTER CONTENT ──────────────────────────────────────────────────────────

class ChapterContentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ChapterContent
        fields = ['id', 'chapter', 'title', 'content_type', 'file', 'file_url', 'url', 'text_content', 'order']
        read_only_fields = ['id', 'file_url']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class ChapterContentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChapterContent
        fields = ['id', 'chapter', 'title', 'content_type', 'file', 'url', 'text_content', 'order']
        read_only_fields = ['id']


# ─── CHAPTER ──────────────────────────────────────────────────────────────────

class ChapterSerializer(serializers.ModelSerializer):
    contents = ChapterContentSerializer(many=True, read_only=True)
    quizzes = serializers.SerializerMethodField()
    content_count = serializers.SerializerMethodField()

    class Meta:
        model = Chapter
        fields = ['id', 'course', 'title', 'description', 'order', 'created_at', 'contents', 'quizzes', 'content_count']
        read_only_fields = ['id', 'created_at']

    def get_quizzes(self, obj):
        return QuizPublicSerializer(obj.quizzes.all(), many=True).data

    def get_content_count(self, obj):
        return obj.contents.count()


class ChapterListSerializer(serializers.ModelSerializer):
    content_count = serializers.SerializerMethodField()
    quiz_count = serializers.SerializerMethodField()

    class Meta:
        model = Chapter
        fields = ['id', 'course', 'title', 'description', 'order', 'content_count', 'quiz_count']
        read_only_fields = ['id']

    def get_content_count(self, obj):
        return obj.contents.count()

    def get_quiz_count(self, obj):
        return obj.quizzes.count()


# ─── COURSE ───────────────────────────────────────────────────────────────────

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'lesson_type', 'duration', 'is_free', 'order']


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'lessons_count', 'duration', 'order', 'lessons']


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'text', 'created_at']
        read_only_fields = ['id', 'user_name', 'created_at']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class CourseSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    modules = ModuleSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    chapters = ChapterListSerializer(many=True, read_only=True)
    chapter_count = serializers.SerializerMethodField()
    quiz_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'category', 'category_detail', 'level',
            'description', 'instructor', 'duration', 'students_count',
            'rating', 'materials_count', 'created_at', 'modules', 'reviews',
            'chapters', 'chapter_count', 'quiz_count',
        ]
        read_only_fields = ['id', 'created_at']

    def get_chapter_count(self, obj):
        return obj.chapters.count()

    def get_quiz_count(self, obj):
        return obj.quizzes.count()


class CourseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    cat = serializers.SerializerMethodField()
    category_detail = CategorySerializer(source='category', read_only=True)
    chapter_count = serializers.SerializerMethodField()
    quiz_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'cat', 'category_detail', 'level', 'description',
            'instructor', 'duration', 'students_count', 'rating', 'materials_count',
            'chapter_count', 'quiz_count',
        ]

    def get_cat(self, obj):
        return obj.category.key if obj.category else 'network'

    def get_chapter_count(self, obj):
        return obj.chapters.count()

    def get_quiz_count(self, obj):
        return obj.quizzes.count()


# ─── ENROLLMENT ───────────────────────────────────────────────────────────────

class EnrollmentSerializer(serializers.ModelSerializer):
    course_detail = CourseListSerializer(source='course', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'course_detail', 'progress', 'status', 'enrolled_at', 'last_accessed', 'completed_content_ids']
        read_only_fields = ['id', 'enrolled_at', 'last_accessed']


# ─── QUIZ ─────────────────────────────────────────────────────────────────────

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'question', 'options', 'correct_answer', 'explanation', 'course', 'chapter', 'order']


class QuizPublicSerializer(serializers.ModelSerializer):
    """Hides correct_answer until answered."""
    class Meta:
        model = Quiz
        fields = ['id', 'question', 'options', 'course', 'chapter', 'order']


class QuizAttemptSerializer(serializers.ModelSerializer):
    is_correct = serializers.BooleanField(read_only=True)
    correct_answer = serializers.SerializerMethodField()
    explanation = serializers.SerializerMethodField()

    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'chosen_answer', 'is_correct', 'correct_answer', 'explanation', 'attempted_at']
        read_only_fields = ['id', 'is_correct', 'attempted_at']

    def get_correct_answer(self, obj):
        return obj.quiz.correct_answer

    def get_explanation(self, obj):
        return obj.quiz.explanation

    def create(self, validated_data):
        quiz = validated_data['quiz']
        chosen = validated_data['chosen_answer']
        validated_data['is_correct'] = (chosen == quiz.correct_answer)
        return super().create(validated_data)


# ─── BADGE ────────────────────────────────────────────────────────────────────

class BadgeSerializer(serializers.ModelSerializer):
    earned = serializers.SerializerMethodField()
    earned_at = serializers.SerializerMethodField()

    class Meta:
        model = Badge
        fields = ['id', 'name', 'icon', 'description', 'background_color', 'xp_reward', 'earned', 'earned_at']

    def get_earned(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return obj.user_badges.filter(user=user).exists()
        return False

    def get_earned_at(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            ub = obj.user_badges.filter(user=user).first()
            return ub.earned_at if ub else None
        return None


# ─── UPLOADED FILE ────────────────────────────────────────────────────────────

class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = ['id', 'name', 'file', 'url', 'file_type', 'size', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at', 'size']


# ─── LEARNING ACTIVITY ────────────────────────────────────────────────────────

class LearningActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningActivity
        fields = ['id', 'date', 'minutes_studied']


# ─── AI MESSAGES ──────────────────────────────────────────────────────────────

class AIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIMessage
        fields = ['id', 'role', 'text', 'created_at']
        read_only_fields = ['id', 'created_at']
