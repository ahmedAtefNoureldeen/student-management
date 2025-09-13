# Student Management System

This repository contains a **full-stack student management system** with two main projects:
- **student-management-front** → Frontend (React/Next.js + TailwindCSS + shadcn/ui)
- **student-management-back** → Backend (Nest.js+ SQLite with entity models)

---

## Demo
[Student_Management_System.mp4](https://github.com/ahmedAtefNoureldeen/student-management/issues/1#issue-3414149545)

## 🚀 Features

- Manage **students**, **classes**, and **grades**
- Upload files to bulk create or update records
- Automatic update of related tables when data changes
- REST API backend with SQLite database
- Modern UI with Next.js frontend
- JWT-based authentication system

---

## 📂 Project Structure

```
student-management/
├── student-management-front/    # Frontend (Next.js + TailwindCSS)
└── student-management-back/     # Backend (Nest.js + SQLite)
```

---

## ⚙️ Backend Setup (student-management-back)

### 1. Navigate to the backend folder:
```bash
cd student-management/student-management-back
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Create environment configuration:
Create a `.env` file in the backend folder with the following content:

```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure

# Database Configuration (SQLite)
DATABASE_PATH=./database.sqlite

# Server Configuration
PORT=3001

# Environment
NODE_ENV=development
```



### 5. Start the backend server:
```bash
npm run start:dev
```

The backend will be available at: `http://localhost:3001`

---

## 💻 Frontend Setup (student-management-front)

### 1. Navigate to the frontend folder:
```bash
cd student-management/student-management-front
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Configure environment (optional):
Create a `.env.local` file if you need custom API URLs:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Start the development server:
```bash
npm run dev
```

### 5. Open in browser:
```
http://localhost:3000
```

---

## 🛠️ Tech Stack

### Frontend:
- **Next.js** - React framework with server-side rendering
- **React** - UI library
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components

### Backend:
- **Nest.js** - Web framework
- **SQLite** - Lightweight database
- **JWT** - Authentication tokens
- **Entity Models** - Database schema management

### API:
- **REST** - API architecture
- **JWT-based authentication** - Secure user sessions

---



## 📋 Usage Instructions

### 1. File Upload Feature
When you upload a file (CSV format), the system will:
- **Create** students, classes, and grades if they don't exist
- **Update** grades if students/classes already exist
- **Automatically update** related tables when needed

### 2. Expected CSV Format
```csv
student_name,student_email,class_name,grade,score
John Doe,john@example.com,Mathematics 101,A,95
Jane Smith,jane@example.com,Science 101,B,87
```

### 3. Running Both Servers
Make sure to run both servers simultaneously:

**Terminal 1 (Backend):**
```bash
cd student-management-back
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd student-management-front
npm run dev
```

---

## 🐛 Troubleshooting

### Common Issues:

1. **Port conflicts**: Make sure ports 3000 and 3001 are available
2. **Database errors**: The SQLite file (`database.sqlite`) will be created automatically in the backend folder
3. **CORS issues**: The backend should be configured to accept requests from the frontend
4. **JWT errors**: Make sure you have a proper JWT_SECRET in your `.env` file

### Database Reset:
If you need to reset the database:
```bash
# Delete the SQLite file
rm student-management-back/database.sqlite

# Restart the backend server
cd student-management-back
npm run dev
```

---

## 🔧 Development

### Available Scripts:

**Backend:**
```bash
npm run dev      # Start development server
npm run start    # Start production server
npm run migrate  # Run database migrations (if available)
```

**Frontend:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
```

