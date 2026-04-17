from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        # Add Chapter model
        migrations.CreateModel(
            name='Chapter',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('order', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chapters', to='api.course')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        # Add ChapterContent model
        migrations.CreateModel(
            name='ChapterContent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('content_type', models.CharField(
                    choices=[('video', 'Video'), ('note', 'Note / Text'), ('pdf', 'PDF'), ('image', 'Image'), ('link', 'External Link')],
                    default='note', max_length=10
                )),
                ('file', models.FileField(blank=True, null=True, upload_to='course_content/%Y/%m/')),
                ('url', models.URLField(blank=True)),
                ('text_content', models.TextField(blank=True)),
                ('order', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('chapter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='contents', to='api.chapter')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        # Add chapter FK to Quiz
        migrations.AddField(
            model_name='quiz',
            name='chapter',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='quizzes', to='api.chapter'),
        ),
        # Add order field to Quiz
        migrations.AddField(
            model_name='quiz',
            name='order',
            field=models.IntegerField(default=0),
        ),
        # Add completed_content_ids to Enrollment
        migrations.AddField(
            model_name='enrollment',
            name='completed_content_ids',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
