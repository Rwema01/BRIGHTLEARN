# BrightLearn - Interactive Learning Platform

![BrightLearn Logo](Fronted/BRIGHTLEARN.jpg)

BrightLearn is a web-based interactive learning platform designed to help students study core subjects (Math, English, History) through structured lessons and quizzes. The application tracks progress, provides performance feedback, and offers a personalized learning experience.

## Features

- **Interactive Courses**: Engaging lessons in Math, English, and History
- **Progress Tracking**: Visual progress indicators for each course
- **Quiz System**: Immediate scoring with pass/fail indicators (75% threshold)
- **Learning History**: Detailed record of completed activities and quiz results
- **Responsive Design**: Works on desktop and mobile devices
- **User Authentication**: Secure login and registration system
- **Notification System**: Alerts for new assignments and graded work
- **Help Center**: Organized documentation and support resources

## Technologies Used

### Frontend
- HTML5, CSS3, JavaScript
- [Font Awesome](https://fontawesome.com/) - Icons
- [Chart.js](https://www.chartjs.org/) - Progress visualization

### Backend
- (To be implemented by backend team)

## Team Members

| Role               | Team Member                     |
|--------------------|---------------------------------|
| Frontend Developer | Gisa Rwema                      |
| Frontend Developer | Deng Akol                       |
| Backend Developer  | Kelly Nshuti Dushimimana        |
| Backend Developer  | Christian Ntwali Ishimwe        |
| UI/UX Designer     | Vestine Umukundwa               |
| UI/UX Designer     | Tabitha Kuir                    |



# Learning Management System (LMS) - Frontend

A responsive frontend for an LMS built with **HTML5, CSS3, and vanilla JavaScript**, designed to interact with a Node.js/Express.js backend. Features dynamic content loading, user authentication, and interactive quizzes.

---

## 🖥️ Live Demo  
🔗 [https://your-deployment-link.com](https://your-deployment-link.com) *(if deployed)*  

---

## ✨ Features  

- **User Authentication**  
  - Login/register forms with JWT token handling.  
  - Protected routes for authenticated users.  

- **Course Dashboard**  
  - Browse courses by subject/level.  
  - Responsive grid/card layout.  

- **Lesson Viewer**  
  - Dynamic loading of lesson content (text, videos).  
  - Navigation between lessons.  

- **Quiz System**  
  - Interactive multiple-choice quizzes.  
  - Real-time feedback on answers.  

- **No Frameworks**  
  - Pure JavaScript DOM manipulation.  
  - CSS Flexbox/Grid for layouts.  

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
