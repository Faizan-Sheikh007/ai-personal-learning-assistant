from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    roll_number = models.CharField(max_length=50, blank=True)
    role = models.CharField(max_length=100, default='Student')
    xp = models.IntegerField(default=0)
    level = models.CharField(max_length=50, default='Beginner')
    daily_goal = models.IntegerField(default=30)
    streak = models.IntegerField(default=0)
    streak_last_updated = models.DateField(null=True, blank=True)
    department = models.CharField(max_length=100, default='CS Department')
    avatar_initials = models.CharField(max_length=3, blank=True)

    class Meta:
        verbose_name = 'User'

    def save(self, *args, **kwargs):
        if self.first_name or self.last_name:
            parts = f"{self.first_name} {self.last_name}".strip().split()
            self.avatar_initials = ''.join(p[0] for p in parts[:2]).upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.get_full_name() or self.username


class Category(models.Model):
    key = models.CharField(max_length=50, unique=True)
    label = models.CharField(max_length=100)
    icon = models.CharField(max_length=10, default='📚')
    color = models.CharField(max_length=20, default='#1a2744')
    pill_class = models.CharField(max_length=30, default='pill-purple')

    def __str__(self):
        return self.label

    class Meta:
        verbose_name_plural = 'Categories'


class Course(models.Model):
    LEVEL_CHOICES = [('Beginner', 'Beginner'), ('Intermediate', 'Intermediate'), ('Advanced', 'Advanced')]
    title = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='courses')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='Beginner')
    description = models.TextField()
    instructor = models.CharField(max_length=150)
    duration = models.CharField(max_length=20, default='1h')
    students_count = models.IntegerField(default=0)
    rating = models.FloatField(default=0.0)
    materials_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


# ─── CHAPTER & CONTENT ────────────────────────────────────────────────────────

class Chapter(models.Model):
    """A chapter / section inside a course."""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} › {self.title}"


class ChapterContent(models.Model):
    """A piece of content inside a chapter: video, note, PDF, image, or link."""
    TYPE_CHOICES = [
        ('video', 'Video'),
        ('note', 'Note / Text'),
        ('pdf', 'PDF'),
        ('image', 'Image'),
        ('link', 'External Link'),
    ]
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='contents')
    title = models.CharField(max_length=255)
    content_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='note')
    # For file-based types (video, pdf, image)
    file = models.FileField(upload_to='course_content/%Y/%m/', blank=True, null=True)
    # For external links
    url = models.URLField(blank=True)
    # For text notes
    text_content = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.chapter.title} › {self.title}"


# ─── ENROLLMENT ───────────────────────────────────────────────────────────────

class Enrollment(models.Model):
    STATUS_CHOICES = [('not-started', 'Not Started'), ('in-progress', 'In Progress'), ('completed', 'Completed')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    progress = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not-started')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(auto_now=True)
    # Track which content items have been completed
    completed_content_ids = models.JSONField(default=list, blank=True)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user} - {self.course} ({self.progress}%)"


# ─── LEGACY MODULE / LESSON (kept for backward compat) ───────────────────────

class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255)
    lessons_count = models.IntegerField(default=0)
    duration = models.CharField(max_length=20)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']


class Lesson(models.Model):
    TYPE_CHOICES = [('video', 'Video'), ('reading', 'Reading'), ('lab', 'Lab'), ('quiz', 'Quiz')]
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    lesson_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='video')
    duration = models.CharField(max_length=20)
    is_free = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']


# ─── QUIZ ─────────────────────────────────────────────────────────────────────

class Quiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='quizzes')
    chapter = models.ForeignKey(Chapter, on_delete=models.SET_NULL, null=True, blank=True, related_name='quizzes')
    question = models.TextField()
    options = models.JSONField()          # list of strings
    correct_answer = models.IntegerField()  # 0-based index
    explanation = models.TextField(blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Quizzes'
        ordering = ['order']

    def __str__(self):
        return self.question[:60]


class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    chosen_answer = models.IntegerField()
    is_correct = models.BooleanField()
    attempted_at = models.DateTimeField(auto_now_add=True)


# ─── BADGES ───────────────────────────────────────────────────────────────────

class Badge(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=10)
    description = models.CharField(max_length=255)
    background_color = models.CharField(max_length=50, default='rgba(108,71,255,.2)')
    xp_reward = models.IntegerField(default=50)

    def __str__(self):
        return self.name


class UserBadge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='user_badges')
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge')


# ─── UPLOADED FILE ────────────────────────────────────────────────────────────

class UploadedFile(models.Model):
    TYPE_CHOICES = [('pdf', 'PDF'), ('video', 'Video'), ('image', 'Image'), ('text', 'Text'), ('link', 'Link'), ('default', 'Other')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_files')
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/%Y/%m/', blank=True, null=True)
    url = models.URLField(blank=True)
    file_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='default')
    size = models.CharField(max_length=30, default='0 B')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# ─── LEARNING ACTIVITY ────────────────────────────────────────────────────────

class LearningActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    date = models.DateField()
    minutes_studied = models.FloatField(default=0)

    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date']


class AIMessage(models.Model):
    ROLE_CHOICES = [('user', 'User'), ('ai', 'AI')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']


class Review(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(default=5)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course', 'user')
