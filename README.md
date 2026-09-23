# 🏋️ PY Fitness — Online Gym Management System

A full-stack gym management system built with React.js, Node.js, Express, and MySQL.
Designed as a university capstone project demonstrating a production-ready web application.

---

## 🧱 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React.js + Tailwind CSS             |
| Backend    | Node.js + Express.js                |
| Database   | MySQL or SQLite + Sequelize ORM     |
| Auth       | JWT + bcrypt                        |
| HTTP       | Axios                               |
| Toasts     | react-hot-toast                     |
| Icons      | lucide-react                        |

---

## 👥 User Roles

| Role   | Access                                                                 |
|--------|------------------------------------------------------------------------|
| Admin  | Full CRUD on members, plans, sessions; send notifications; view all bookings |
| Member | View dashboard, book sessions, view plans, manage profile, generate AI plan |

---

## ☁️ Live on AWS (free tier)

One command deploys the app to a single free-tier EC2 server, with HTTPS and a $0.01 billing alarm.
See **[deploy/aws/README.md](deploy/aws/README.md)**.

---

## ⚡ Quick Start (no MySQL needed)

```bash
cd backend && npm install
printf 'DB_DIALECT=sqlite\nJWT_SECRET=dev_secret\nAUTO_SEED=true\n' > .env
npm start                       # API on http://localhost:5000, demo data seeded automatically

cd ../frontend && npm install && npm start   # app on http://localhost:3000
```

For a production-style single server, run `npm run build` in `frontend/`. The backend then serves the built app itself at http://localhost:5000.

---

## 🚀 How to Run (MySQL)

### Prerequisites
- Node.js v18+
- MySQL running locally OR a cloud MySQL instance

---

### Step 1 — Clone / Open the project
```bash
cd gym-management
```

### Step 2 — Setup Backend
```bash
cd backend
npm install
```

Edit `.env`:
```
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=gym_management
DB_USER=root
DB_PASS=your_mysql_password

JWT_SECRET=gym_super_secret_jwt_key_2024
JWT_EXPIRE=7d
```

### Step 3 — Create MySQL Database
```bash
mysql -u root -p
```
```sql
CREATE DATABASE gym_management;
EXIT;
```

### Step 4 — Seed the Database (Demo Data)
```bash
npm run seed
```

This creates:
- 1 Admin account
- 3 Member accounts
- 2 Workout Plans (Beginner + Advanced)
- 2 Diet Plans (Weight Loss + Muscle Gain)
- 5 Upcoming Training Sessions

### Step 5 — Start the Backend
```bash
npm run dev
# Server runs on http://localhost:5000
```

### Step 6 — Setup & Start Frontend
```bash
cd ../frontend
npm install
npm start
# App runs on http://localhost:3000
```

---

## 🔑 Demo Login Credentials

| Role   | Email             | Password   |
|--------|-------------------|------------|
| Admin  | admin@gym.com     | admin123   |
| Member | john@gym.com      | member123  |
| Member | sarah@gym.com     | member123  |
| Member | mike@gym.com      | member123  |

> 💡 The Login page has **"Fill Admin"** and **"Fill Member"** buttons for quick demo access.

---

## 📁 Project Structure

```
gym-management/
├── backend/
│   ├── config/
│   │   ├── db.js              # Sequelize MySQL connection + sync
│   │   ├── associations.js    # Sequelize model relationships
│   │   └── seed.js            # Demo data seeder
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js  # Includes AI plan generation
│   │   ├── adminController.js
│   │   ├── bookingController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── WorkoutPlan.js     # JSON column for schedule
│   │   ├── DietPlan.js        # JSON column for meals
│   │   ├── Session.js
│   │   ├── Booking.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js           # Includes /generate-plan
│   │   ├── admin.js
│   │   ├── bookings.js
│   │   ├── notifications.js
│   │   └── sessions.js
│   ├── utils/
│   │   └── planGenerator.js   # BMI + AI plan logic
│   ├── .env
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        │   ├── admin/
        │   │   └── AdminLayout.jsx
        │   └── shared/
        │       ├── Navbar.jsx
        │       ├── ProtectedRoute.jsx
        │       ├── StatCard.jsx
        │       ├── Modal.jsx
        │       └── SessionCard.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── Home.jsx               # Public landing page
        │   ├── HomeLoggedIn.jsx       # Personalized home for logged-in users
        │   ├── auth/
        │   │   ├── Login.jsx
        │   │   └── Register.jsx
        │   ├── member/
        │   │   ├── MemberDashboard.jsx  # AI plan generation + BMI
        │   │   ├── Sessions.jsx
        │   │   ├── BookingHistory.jsx
        │   │   └── Profile.jsx
        │   └── admin/
        │       ├── AdminDashboard.jsx
        │       ├── AdminMembers.jsx
        │       ├── AdminSessions.jsx
        │       ├── AdminWorkoutPlans.jsx
        │       ├── AdminDietPlans.jsx
        │       ├── AdminBookings.jsx
        │       └── AdminNotifications.jsx
        ├── services/
        │   └── api.js
        └── App.jsx
```

---

## 📊 API Endpoints

### Auth
| Method | Endpoint             | Description        |
|--------|----------------------|--------------------|
| POST   | /api/auth/register   | Register member    |
| POST   | /api/auth/login      | Login              |
| GET    | /api/auth/me         | Get current user   |

### Member
| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| GET    | /api/users/profile          | Get profile                        |
| PUT    | /api/users/profile          | Update profile                     |
| PUT    | /api/users/change-password  | Change password                    |
| POST   | /api/users/generate-plan    | Generate AI workout + diet plan    |

### Sessions (Member)
| Method | Endpoint       | Description              |
|--------|----------------|--------------------------|
| GET    | /api/sessions  | Get upcoming sessions    |

### Bookings
| Method | Endpoint                  | Description       |
|--------|---------------------------|-------------------|
| POST   | /api/bookings             | Book a session    |
| GET    | /api/bookings/my          | My bookings       |
| PUT    | /api/bookings/:id/cancel  | Cancel booking    |

### Notifications
| Method | Endpoint                        | Description          |
|--------|---------------------------------|----------------------|
| GET    | /api/notifications              | Get my notifications |
| GET    | /api/notifications/unread-count | Unread count         |
| PUT    | /api/notifications/read-all     | Mark all read        |
| PUT    | /api/notifications/:id/read     | Mark one read        |

### Admin (all require admin JWT)
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | /api/admin/dashboard            | Stats overview           |
| GET    | /api/admin/members              | List all members         |
| PUT    | /api/admin/members/:id          | Update/assign plans      |
| DELETE | /api/admin/members/:id          | Delete member            |
| CRUD   | /api/admin/workout-plans        | Manage workout plans     |
| CRUD   | /api/admin/diet-plans           | Manage diet plans        |
| CRUD   | /api/admin/sessions             | Manage sessions          |
| GET    | /api/admin/bookings             | View all bookings        |
| POST   | /api/admin/notifications/send   | Send notifications       |

---

## ✨ Key Features

- **JWT Auth** — Secure login with role-based access (admin vs member)
- **Dark Theme** — Full black/grey UI with cyan accents
- **Member Dashboard** — Shows assigned workout plan, diet plan, and upcoming bookings
- **AI Plan Generator** — Generates personalized workout + diet plans based on BMI, body stats, fitness goal, and gym days per week
- **BMI Calculator** — Auto-calculates BMI and category (underweight/normal/overweight/obese)
- **Macro Breakdown** — Diet plans include protein/carbs/fat per food item
- **Sets & Reps** — All workout exercises include sets, reps, and notes
- **Gym Days Selector** — Members choose how many days/week they can train (2-6)
- **Session Booking** — Members can browse, filter, and book sessions
- **Admin CRUD** — Full management of members, plans, and sessions
- **Auto Notifications** — Created automatically on session creation and booking confirmation
- **Personalized Home** — Logged-in users see a personalized home page
- **Responsive UI** — Works on mobile, tablet, and desktop
- **Demo Mode** — Quick-fill buttons on login page

---

## 🧮 AI Plan Generation Logic

1. Member fills in **weight**, **height**, **age**, **fitness goal** in Profile
2. Clicks **Generate My Plan** and selects **gym days per week** (2–6)
3. Backend calculates:
   - **BMI** = weight / height²
   - **BMI Category** (underweight / normal / overweight / obese)
   - **Daily Calories** using Mifflin-St Jeor formula + activity multiplier
   - **Macros** — protein/carbs/fat split based on goal
   - **Training Level** — beginner/intermediate/advanced based on BMI + goal
4. Generates a **workout schedule** with the exact number of gym days selected
5. Generates a **diet plan** with full food items, quantities, calories, and macros per item
6. Plans are saved to MySQL and assigned to the member instantly

---

## 🎓 University Presentation Tips

1. Start by showing the **Home page** (landing page)
2. Login as **Admin** → show dashboard stats → create a new session
3. Logout → Login as **Member (john@gym.com)** → show notification bell
4. Go to **Profile** → fill in weight, height, age → save
5. Go to **Dashboard** → select gym days → click **Generate My Plan**
6. Show the generated workout plan with sets/reps and diet plan with macros
7. Book a session → show booking confirmation notification
8. Go back to **Admin** → Members → assign a different plan manually
