import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/admin/dashboard";
import { GlobalProvider } from "./context/GlobalContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Timetable from "./pages/admin/Timetable";
import Social from "./pages/user/Social";

function App() {
  return (
    <GlobalProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/landing" />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-dashboard" element={<Dashboard />} />
        <Route path="/admin-timetable" element={<Timetable />} />
        <Route path="/social" element={<Social />} />
      </Routes>
    </BrowserRouter>
    </GlobalProvider>
  )
}

export  default App;