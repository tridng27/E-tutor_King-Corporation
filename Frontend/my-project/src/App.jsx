import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/admin/dashboard";
import TutorDashboard from "./pages/tutor/Dashboard"; // Add this import
import StudentDashboard from "./pages/student/Dashboard"; // Add this import
import { GlobalProvider } from "./context/GlobalContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Timetable from "./pages/admin/Timetable";
import Social from "./pages/user/Social";
import ProtectedRoute from "./components/ProtectedRoute"; // Add this import
import Unauthorized from "./pages/Unauthorized"; // Add this import
import MeetingPage from "./pages/meeting/MeetingPage";

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
          
          {/* Protected Tutor Routes */}
          <Route 
            path="/tutor/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Tutor', 'Admin']}>
                <TutorDashboard />
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
          <Route path="/social" element={<Social />} />
        </Routes>
      </BrowserRouter>
    </GlobalProvider>
  )
}

export default App;
