from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Category, Course, Chapter, ChapterContent,
    Enrollment, Module, Lesson,
    Quiz, QuizAttempt, Badge, UserBadge,
    UploadedFile, LearningActivity, AIMessage, Review,
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'get_full_name', 'role', 'xp', 'level', 'streak']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Streva', {'fields': ('roll_number', 'role', 'xp', 'level', 'daily_goal', 'streak', 'department', 'avatar_initials')}),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['label', 'key', 'icon', 'color']


class ChapterContentInline(admin.TabularInline):
    model = ChapterContent
    extra = 1
    fields = ['title', 'content_type', 'file', 'url', 'order']


class QuizInline(admin.TabularInline):
    model = Quiz
    extra = 1
    fields = ['question', 'options', 'correct_answer', 'explanation', 'order']


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'created_at']
    list_filter = ['course']
    inlines = [ChapterContentInline, QuizInline]


@admin.register(ChapterContent)
class ChapterContentAdmin(admin.ModelAdmin):
    list_display = ['title', 'chapter', 'content_type', 'order']
    list_filter = ['content_type', 'chapter__course']


class ChapterInline(admin.TabularInline):
    model = Chapter
    extra = 0
    fields = ['title', 'order']
    show_change_link = True


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'level', 'instructor', 'students_count', 'rating']
    list_filter = ['category', 'level']
    search_fields = ['title', 'instructor']
    inlines = [ChapterInline]


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'progress', 'status', 'enrolled_at']
    list_filter = ['status']


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['question', 'course', 'chapter', 'correct_answer', 'order']
    list_filter = ['course', 'chapter']


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'quiz', 'chosen_answer', 'is_correct', 'attempted_at']


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'xp_reward']


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'badge', 'earned_at']


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'file_type', 'size', 'uploaded_at']


@admin.register(LearningActivity)
class LearningActivityAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'minutes_studied']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['course', 'user', 'rating', 'created_at']
