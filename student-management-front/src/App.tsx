import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { StudentsPage } from './features/students/pages/StudentsPage';
import { ClassesPage } from './features/classes/pages/ClassesPage';
import { GradesPage } from './features/grades/pages/GradesPage';
import { FileUploadPage } from './features/upload/pages/FileUploadPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css'

function App() {
  return (
    <QueryProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students" 
            element={
              <ProtectedRoute>
                <StudentsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/classes" 
            element={
              <ProtectedRoute>
                <ClassesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/grades" 
            element={
              <ProtectedRoute>
                <GradesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute>
                <FileUploadPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryProvider>
  );
}

export default App
