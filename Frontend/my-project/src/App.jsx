import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GlobalProvider } from "./context/GlobalContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/admin/Dashboard";
import TutorDashboard from "./pages/tutor/Dashboard";
import StudentDashboard from "./pages/student/Dashboard";
import Lesson from "./pages/tutor/Lesson"
import Class from "./pages/Class";
import Course from "./pages/Course";
import Timetable from "./pages/user/Timetable";
import Social from "./pages/user/Social";
import MeetingPage from "./pages/meeting/MeetingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Notfound from "./pages/Notfound";
import Unauthorized from "./pages/Unauthorized";
import ResourceDetail from "./components/course/ResourceDetail";
import ResourceForm from "./components/course/ResourceForm";
import AdminPage from "./pages/admin/AdminPage"; 
import DirectMessages from "./pages/DirectMessages";
import SubjectManagement from "./pages/admin/SubjectManagement";
import StudentManagement from "./pages/admin/StudentManagement";

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
          
          {/* Add new Admin Page route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          
          {/* Subject Management Route */}
          <Route
            path="/admin/subjects"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <SubjectManagement />
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
            path="/admin/student"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <StudentManagement />
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
            path="/class/:classId"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <Class />
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
            path="/social"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <Social />
              </ProtectedRoute>
            }
          />

          <Route
            path="/course"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <Course />
              </ProtectedRoute>
            }
          />
          
          {/* Timetable route accessible to all authenticated users */}
          <Route
            path="/timetable"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <Timetable />
              </ProtectedRoute>
            }
          />
          
          {/* Direct Messages Routes */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <DirectMessages />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/messages/:userId"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <DirectMessages />
              </ProtectedRoute>
            }
          />
          
          {/* Resource Routes */}
          <Route
            path="/resource/add"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Tutor']}>
                <ResourceForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resource/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Tutor']}>
                <ResourceForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resource/:id"
            element={
              <ProtectedRoute allowedRoles={[]}>
                <ResourceDetail />
              </ProtectedRoute>
            }
          />
          
          {/* 404 Route */}
          <Route path="*" element={
            <ProtectedRoute allowedRoles={[]}>
              <Notfound/>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </GlobalProvider>
  );
}

export default App;
