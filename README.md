# 📚 B## 🌟 Features

### 📖 Learning Experience
- **Interactive Courses**:## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Git
- Modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Rwema01/BRIGHTLEARN.git
   cd BRIGHTLEARN
   ```

2. **Set Up Backend**
   ```bash
   cd Backend
   npm install
   ```

3. **Set Up Frontend**
   ```bash
   cd ../Fronted
   # No installation needed for frontend as it uses vanilla JavaScript
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd Backend
   npm start
   # Server will start on http://localhost:3000
   ```

2. **Launch the Frontend**
   - Option 1: Using VS Code Live Server
     - Install Live Server extension in VS Code
     - Right-click on `index.html` in the Fronted folder
     - Select "Open with Live Server"

   - Option 2: Using any HTTP server
     ```bash
     cd Fronted
     python -m http.server 8080  # If you have Python installed
     # Or use any other HTTP server of your choice
     ```

3. **Access the Application**
   - Open your browser and navigate to:
     - Frontend: `http://localhost:8080` (or the port shown by your server)
     - Backend API: `http://localhost:3000`

### Default Credentials
```
Username: admin@brightlearn.com
Password: admin123
```

## 🔧 Configuration

### Backend Configuration
1. Create a `.env` file in the Backend directory:
   ```env
   PORT=3000
   JWT_SECRET=your_jwt_secret_here
   CORS_ORIGIN=http://localhost:8080
   ```

2. Modify database settings in `Backend/db/lowdb.js` if needed

### Frontend Configuration
1. Update API endpoint in `Fronted/js/api.js` if needed:
   ```javascript
   const BASE_URL = 'http://localhost:3000/api';
   ```

## 👥 Team Members

| Role               | Team Member                     |
|--------------------|---------------------------------|
| Frontend Developer | Gisa Rwema                      |
| Frontend Developer | Deng Akol                       |
| Backend Developer  | Kelly Nshuti Dushimimana        |
| Backend Developer  | Christian Ntwali Ishimwe        |
| UI/UX Designer     | Vestine Umukundwa               |
| UI/UX Designer     | Tabitha Kuir                    |

## 📁 Project Structureons in Math, English, and History with multimedia content
- **Structured Learning Path**: Progressive curriculum with clear learning objectives
- **Quiz System**: 
  - Immediate scoring and feedback
  - Pass/fail indicators (75% threshold)
  - Multiple question types
  - Progress tracking

### 📊 Progress & Analytics
- **Visual Progress Tracking**: Interactive charts and progress bars
- **Performance Analytics**: Detailed insights into learning patterns
- **Learning History**: Comprehensive record of completed activities
- **Achievement System**: Badges and rewards for completing milestones

### 🛠 User Features
- **Responsive Design**: Seamless experience across all devices
- **User Authentication**: Secure JWT-based login system
- **Profile Management**: Customizable user profiles
- **Notification System**: Real-time alerts for:
  - New assignments
  - Graded work
  - Course updates
  - Achievement unlocks

### 💡 Support & Resources
- **Help Center**: Comprehensive documentation
- **Interactive Tutorials**: Platform navigation guides
- **FAQ Section**: Common questions and answers
- **Support System**: Direct assistance channels

## 🛠️ Tech Stack Interactive Learning Platform

![BrightLearn Logo](Fronted/BRIGHTLEARN.jpg)

BrightLearn is a comprehensive web-based learning platform that empowers students to master core subjects (Math, English, History) through interactive lessons, quizzes, and personalized learning experiences. With real-time progress tracking and performance analytics, students can monitor their growth while engaging with structured educational content.

## ✨ Key Features

- **Interactive Courses**: Engaging lessons in Math, English, and History
- **Progress Tracking**: Visual progress indicators for each course
- **Quiz System**: Immediate scoring with pass/fail indicators (75% threshold)
- **Learning History**: Detailed record of completed activities and quiz results
- **Responsive Design**: Works on desktop and mobile devices
- **User Authentication**: Secure login and registration system
- **Notification System**: Alerts for new assignments and graded work
- **Help Center**: Organized documentation and support resources

## Technologies Used

### 🌐 Frontend
- **Core Technologies**:
  - HTML5
  - CSS3 (Flexbox, Grid, Animations)
  - JavaScript (ES6+)
- **Libraries**:
  - [Font Awesome](https://fontawesome.com/) - Icons and visual elements
  - [Chart.js](https://www.chartjs.org/) - Interactive data visualization
- **State Management**: LocalStorage & SessionStorage
- **API Integration**: Fetch API

### ⚙️ Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: lowdb (JSON-based)
- **Authentication**: 
  - JWT (JSON Web Tokens)
  - bcrypt for password hashing
- **API Security**:
  - CORS configuration
  - Rate limiting
  - Error handling middleware

## 👥 Team Members

| Role               | Team Member                     |
|--------------------|---------------------------------|
| Frontend Developer | Gisa Rwema                      |
| Frontend Developer | Deng Akol                       |
| Backend Developer  | Kelly Nshuti Dushimimana        |
| Backend Developer  | Christian Ntwali Ishimwe        |
| UI/UX Designer     | Vestine Umukundwa               |
| UI/UX Designer     | Tabitha Kuir                    |



# Learning Management System (LMS) - Frontend

```
BRIGHTLEARN/
│
├── Backend/                 # Backend server code
│   ├── controllers/        # Route controllers
│   ├── data/              # JSON database files
│   ├── db/                # Database configuration
│   ├── middleware/        # Express middleware
│   ├── routes/           # API routes
│   ├── server.js         # Main server file
│   └── package.json      # Backend dependencies
│
├── Fronted/               # Frontend code
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript modules
│   │   ├── api.js        # API integration
│   │   ├── grades.js     # Grades functionality
│   │   └── profile.js    # Profile management
│   ├── index.html        # Main entry point
│   ├── courses.html      # Course listing
│   ├── grades.html       # Grades view
│   └── profile.html      # User profile
│
└── README.md             # Project documentation
```

## 🌐 Live Demo
Frontend: [https://brightlearn-du1d.onrender.com](https://brightlearn-du1d.onrender.com)
API: [https://brightlearnbackend.onrender.com](https://brightlearnbackend.onrender.com)

---

## 📝 API Documentation

### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
```

### User Endpoints
```
GET    /api/user/:id/profile
PUT    /api/user/:id/profile
POST   /api/user/:id/avatar
```

### Course Endpoints
```
GET    /api/courses
GET    /api/courses/:id
GET    /api/courses/:id/lessons
POST   /api/courses/:id/enroll
```

### Grades Endpoints
```
GET    /api/grades/user/:id
GET    /api/grades/course/:id
POST   /api/grades/submit
```

## ⚡ Performance Optimization

- Minified CSS and JavaScript files
- Optimized image loading with lazy loading
- Efficient DOM manipulation
- Local storage for caching when appropriate

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- XSS protection
- CSRF protection

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS settings match frontend origin
   - Check if the API URL is correct in `api.js`

2. **Authentication Issues**
   - Clear browser cache and local storage
   - Check if token is being sent in requests
   - Verify token expiration

3. **Loading Issues**
   - Check network connection
   - Verify API endpoints are accessible
   - Look for console errors

### Debug Mode
Enable debug mode by adding to your browser's console:
```javascript
localStorage.setItem('debug', 'true');
```

## 📮 Support

For support, please:
1. Check the [FAQ section](#) in the Help Center
2. Open an issue on GitHub
3. Contact the development team

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by the BrightLearn Team  

---

## 🛠️ Tech Stack  

- **Core**: HTML5, CSS3, JavaScript (ES6+)  
- **Styling**: CSS3 (Flexbox, Grid, Animations)  
- **State Management**: Session Storage (JWT)  
- **API Calls**: Fetch API  
- **Bundler**: Vite *(optional)*  

---

## 🚀 Setup  

1. **Clone the repo**  
   ```bash
   git clone https://github.com/your-username/lms-frontend.git
   cd lms-frontend

# Learning Management System (LMS)

A lightweight LMS built with a **Node.js/Express.js** backend and a **vanilla HTML/CSS/JS** frontend, using a JSON-based database (`lowdb`). Supports user authentication, course management, lessons, and quizzes.

---

## 🚀 Features

- **User Authentication**  
  - Secure registration/login with **bcrypt** password hashing.  
  - JWT-based session management.  

- **Course Management**  
  - Create, read, update, and delete courses.  
  - Organize courses by subject and difficulty level.  

- **Lessons & Quizzes**  
  - Lessons with embedded content (text, videos).  
  - Interactive quizzes with multiple-choice questions.  

- **Lightweight Database**  
  - Uses `lowdb` (JSON file-based) for simplicity.  

---

## 🛠 Tech Stack

**Frontend**  
- HTML5, CSS3, JavaScript (ES6+)  

**Backend**  
- **Runtime**: Node.js  
- **Framework**: Express.js  
- **Database**: lowdb (JSON)  
- **Security**: bcrypt, jsonwebtoken (JWT)  

---

## 📦 Installation

1. **Clone the repo**  
   ```bash
   git clone https://github.com/your-username/lms-json.git
   cd lms-json
