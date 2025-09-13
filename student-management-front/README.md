# Student Management Frontend

A React-based frontend application for managing students, classes, and grades.

## Features

- **Authentication**: Login and registration pages with form validation
- **Routing**: React Router for navigation between pages
- **State Management**: React Query for server state management
- **Responsive Design**: Mobile-first responsive design with Tailwind CSS
- **Protected Routes**: Authentication-based route protection
- **Feature-based Architecture**: Organized code structure by features

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx          # Main layout wrapper
│   │   └── Navbar.tsx          # Navigation bar
│   ├── ui/
│   │   ├── Button.tsx          # Reusable button component
│   │   └── Input.tsx           # Reusable input component
│   └── ProtectedRoute.tsx      # Route protection component
├── features/
│   ├── auth/
│   │   └── pages/
│   │       ├── LoginPage.tsx   # Login form
│   │       └── RegisterPage.tsx # Registration form
│   ├── dashboard/
│   │   └── pages/
│   │       └── DashboardPage.tsx # Main dashboard
│   ├── students/
│   │   └── pages/
│   │       └── StudentsPage.tsx # Student management
│   ├── classes/
│   │   └── pages/
│   │       └── ClassesPage.tsx # Class management
│   └── grades/
│       └── pages/
│           └── GradesPage.tsx  # Grade management
├── hooks/
│   ├── useLogin.ts            # Login mutation hook
│   └── useRegister.ts         # Registration mutation hook
├── pages/
│   └── HomePage.tsx           # Landing page
├── providers/
│   └── QueryProvider.tsx      # React Query provider
├── services/
│   └── apiAuth.ts             # Authentication API calls
└── App.tsx                    # Main app component with routing
```

## API Endpoints

The application connects to the following backend endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Dependencies

- **React 19** - UI library
- **React Router DOM** - Client-side routing
- **React Query** - Server state management
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety

## Features Implemented

✅ React Router setup with protected routes  
✅ Authentication pages (login/register) with form validation  
✅ Responsive navbar and layout components  
✅ Services folder with API authentication  
✅ React Query custom hooks for mutations  
✅ Feature-based project organization  
✅ Responsive design with Tailwind CSS  
✅ TypeScript support throughout  

## Next Steps

- Implement student management CRUD operations
- Add class management functionality
- Create grade tracking system
- Add data tables and pagination
- Implement search and filtering
- Add user profile management