import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import TodoPage from "./pages/TodoPage";
import WaterPage from "./pages/WaterPage";
import ExpensePage from "./pages/ExpensePage";
import DashboardPage from "./pages/DashboardPage";
import InsightsPage from "./pages/InsightsPage";
import MoodPage from "./pages/MoodPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AboutPage from "./pages/AboutPage";
import FeaturePage from "./pages/FeaturePage";

export const applyTheme = (theme) => {
  const root = document.documentElement
  if (theme === "dark") {
    root.classList.add("dark")
  } else if (theme === "light") {
    root.classList.remove("dark")
  } else {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    systemDark ? root.classList.add("dark") : root.classList.remove("dark")
  }
}

applyTheme(localStorage.getItem("theme") || "system")


function App() {
  const { user } = useAuth();
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Root route */}
        <Route
          path="/"
          element={user ? <DashboardPage /> : <Landing />}
        />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<AboutPage />} />
         <Route path="/features" element={<FeaturePage />} />
  

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/todo"
          element={
            <ProtectedRoute>
              <TodoPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/water"
          element={
            <ProtectedRoute>
              <WaterPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expense"
          element={
            <ProtectedRoute>
              <ExpensePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <InsightsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mood"
          element={
            <ProtectedRoute>
              <MoodPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;