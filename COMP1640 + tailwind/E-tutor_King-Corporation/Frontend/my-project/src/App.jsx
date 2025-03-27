import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GlobalProvider } from "./context/GlobalContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/admin/Dashboard";
import TutorDashboard from "./pages/tutor/Dashboard";
import StudentDashboard from "./pages/student/Dashboard";
import Timetable from "./pages/admin/Timetable";
import StudentTimetable from "./pages/student/Timetable";
import Social from "./pages/user/social";
import MeetingPage from "./pages/meeting/MeetingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import Course from "./pages/admin/Course";
import AddCourse from "./pages/admin/Addcourse";
import Lesson from "./pages/tutor/Lesson";


import TutorStudent from "./pages/tutor/Student";

function App() {
  return (
    <GlobalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/landing" />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/meeting/:meetingId" element={<MeetingPage />} />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/timetable" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Timetable />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/course" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Course />
              </ProtectedRoute>
            } 
          /> 

          <Route 
            path="/admin/add-course" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AddCourse />
              </ProtectedRoute>
            } 
          /> 
          
          {/* Protected Tutor Routes */}
          <Route 
            path="/tutor/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Tutor']}>
                <TutorDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/tutor/lesson" 
            element={
              <ProtectedRoute allowedRoles={['Tutor']}>
                <Lesson />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/tutor/student" 
            element={
              <ProtectedRoute allowedRoles={['Tutor']}>
                <TutorStudent />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Student Routes */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/student/timetable" 
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentTimetable />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/social" 
            element={
              <ProtectedRoute allowedRoles={[]}>
                <Social />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Route */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </BrowserRouter>
    </GlobalProvider>
  );
}

export default App;
