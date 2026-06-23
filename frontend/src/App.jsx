import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";

import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardSupervisor from "./pages/DashboardSupervisor";
import DashboardStudent from "./pages/DashboardStudent";

import Deliverables from "./pages/Deliverables";

import Topics from "./pages/Topics";

import Tasks from "./pages/Tasks";

import Messages from "./pages/Messages";

import Internships from "./pages/Internships";

import PlanningAI from "./pages/PlanningAI";

import Statistics from "./pages/Statistics";

import Assignments from "./pages/Assignments";
import Collaboration from "./pages/Collaboration";
import Settings from "./pages/Settings";

import { getRole, getToken } from "./services/auth";

// Protection des routes
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = getToken();
  const role = getRole();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirige vers le dashboard approprié du rôle connecté pour éviter une déconnexion involontaire
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "supervisor") return <Navigate to="/supervisor" replace />;
    if (role === "student") return <Navigate to="/student" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ========================= */}
        {/* Route publique */}
        {/* ========================= */}

        <Route path="/" element={<Login />} />

        {/* ========================= */}
        {/* Dashboard Admin */}
        {/* ========================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* Dashboard Encadrant */}
        {/* ========================= */}

        <Route
          path="/supervisor"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <DashboardSupervisor />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* Dashboard Stagiaire */}
        {/* ========================= */}

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <DashboardStudent />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* Gestion des Sujets */}
        {/* ========================= */}

        <Route
          path="/topics"
          element={
            <ProtectedRoute allowedRoles={["admin", "supervisor", "student"]}>
              <Topics />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* Kanban */}
        {/* ========================= */}

        <Route
          path="/tasks"
          element={
            <ProtectedRoute allowedRoles={["admin", "supervisor", "student"]}>
              <Tasks />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* Livrables */}
        {/* ========================= */}

        <Route
          path="/deliverables"
          element={
            <ProtectedRoute allowedRoles={["admin", "supervisor", "student"]}>
              <Deliverables />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* Messagerie */}
        {/* ========================= */}

        <Route path="/messages" element={<Messages />} />

        {/* ========================= */}
        {/* Stages */}
        {/* ========================= */}

        <Route
          path="/internships"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Internships />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* Planning IA */}
        {/* ========================= */}

        <Route
          path="/planning-ai"
          element={
            <ProtectedRoute allowedRoles={["admin", "supervisor", "student"]}>
              <PlanningAI />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* Statistiques */}
        {/* ========================= */}

        <Route
          path="/statistics"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Statistics />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* Affectations */}
        {/* ========================= */}

        <Route
          path="/assignments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Assignments />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* Collaboration */}
        {/* ========================= */}

        <Route
          path="/collaboration"
          element={
            <ProtectedRoute allowedRoles={["admin", "supervisor", "student"]}>
              <Collaboration />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* Paramètres */}
        {/* ========================= */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* Route inconnue */}
        {/* ========================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;