# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
# Streva Django Backend

REST API backend for the **Streva** cybersecurity learning platform.

---

## Quick Start

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Apply migrations & seed data
```bash
python manage.py migrate
python manage.py seed
```

### 3. Run the server
```bash
python manage.py runserver
```

API is now live at **http://localhost:8000/api/**  
Django Admin: **http://localhost:8000/admin/**

---

## Default Accounts

| Role    | Username    | Password   |
|---------|-------------|------------|
| Student | syed.roni   | streva123  |
| Admin   | admin       | admin123   |

---

## API Reference

### Authentication
All endpoints except register/login require a **Token** in the `Authorization` header:
```
Authorization: Token <your_token>
```

| Method | Endpoint               | Description        |
|--------|------------------------|--------------------|
| POST   | `/api/auth/register/`  | Register new user  |
| POST   | `/api/auth/login/`     | Login → get token  |
| POST   | `/api/auth/logout/`    | Invalidate token   |

### User
| Method | Endpoint        | Description              |
|--------|-----------------|--------------------------|
| GET    | `/api/me/`      | Get current user profile |
| PATCH  | `/api/me/`      | Update profile           |
| GET    | `/api/dashboard/` | Dashboard stats + weekly activity |

### Courses
| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| GET    | `/api/courses/`                       | List all courses         |
| GET    | `/api/courses/?category=network`      | Filter by category key   |
| GET    | `/api/courses/?level=Beginner`        | Filter by level          |
| GET    | `/api/courses/?search=firewall`       | Search by title          |
| GET    | `/api/courses/{id}/`                  | Course detail + modules  |
| GET    | `/api/courses/{id}/with_enrollment/`  | Course + enrollment info |
| GET    | `/api/categories/`                    | List all categories      |

### Enrollments
| Method | Endpoint                                    | Description          |
|--------|---------------------------------------------|----------------------|
| GET    | `/api/enrollments/`                         | My enrollments       |
| POST   | `/api/enrollments/`                         | Enroll in a course   |
| PATCH  | `/api/enrollments/{id}/update_progress/`    | Update progress %    |
| DELETE | `/api/enrollments/{id}/`                    | Unenroll             |

### Quizzes
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/api/quizzes/`       | All quizzes              |
| GET    | `/api/quizzes/?course={id}` | Quizzes for a course |
| POST   | `/api/quiz/attempt/`  | Submit an answer         |
| GET    | `/api/quiz/history/`  | My quiz attempts         |

### Badges
| Method | Endpoint        | Description              |
|--------|-----------------|--------------------------|
| GET    | `/api/badges/`  | All badges (earned flag) |

### File Upload
| Method | Endpoint         | Description                 |
|--------|------------------|-----------------------------|
| GET    | `/api/files/`    | My uploaded files           |
| POST   | `/api/files/`    | Upload file (multipart) or add URL |
| DELETE | `/api/files/{id}/` | Remove a file             |

### AI Tutor Chat
| Method | Endpoint         | Description          |
|--------|------------------|----------------------|
| GET    | `/api/ai/chat/`  | Chat history         |
| POST   | `/api/ai/chat/`  | Send message → AI reply |

### Learning Activity
| Method | Endpoint         | Description                 |
|--------|------------------|-----------------------------|
| GET    | `/api/activity/` | Last 30 days of activity    |
| POST   | `/api/activity/` | Log study minutes for today |

### Reviews
| Method | Endpoint                      | Description         |
|--------|-------------------------------|---------------------|
| GET    | `/api/reviews/?course={id}`   | Reviews for course  |
| POST   | `/api/reviews/`               | Add a review        |

---

## Connecting React Frontend

1. Copy `api_service.js` → `streva-react/src/streva-api.js`

2. Add to your `.env` in the React project:
```
REACT_APP_API_URL=http://localhost:8000/api
```

3. Replace static data calls in `AppContext.jsx`. Example:

```js
import api from './streva-api';

// On mount — load user & courses from the real API
useEffect(() => {
  api.user.me().then(setUser);
  api.courses.list().then(data => setCourses(data.results));
  api.enrollments.mine().then(data => setEnrollments(data.results));
}, []);

// Login flow
const handleLogin = async (username, password) => {
  const { user } = await api.auth.login(username, password);
  setUser(user);
};

// Enroll in a course
const handleEnroll = (courseId) => api.enrollments.enroll(courseId);

// Update progress
const handleProgress = (enrollmentId, pct) =>
  api.enrollments.updateProgress(enrollmentId, pct);

// Upload a file
const handleUpload = (file) => {
  const fd = new FormData();
  fd.append('file', file);
  return api.files.upload(fd);
};

// AI chat
const sendMessage = (text) => api.ai.send(text);
```

---

## Project Structure

```
streva_backend/
├── manage.py
├── requirements.txt
├── api_service.js          ← copy into React src/
├── db.sqlite3              ← auto-created after migrate
├── media/                  ← uploaded files
├── streva_backend/
│   ├── settings.py
│   └── urls.py
└── api/
    ├── models.py           ← User, Course, Enrollment, Quiz, Badge, …
    ├── serializers.py      ← DRF serializers
    ├── views.py            ← ViewSets + API views
    ├── urls.py             ← API route definitions
    ├── admin.py            ← Django Admin config
    └── management/
        └── commands/
            └── seed.py     ← python manage.py seed
```
