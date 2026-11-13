import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import ProblemList from "./pages/ProblemList";
import ProblemDetail from "./pages/ProblemDetail";
import Prep from "./pages/Prep";
import AdminTestCases from "./pages/AdminTestCases";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/problems"
                    element={
                        <ProtectedRoute>
                            <ProblemList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/problems/:id"
                    element={
                        <ProtectedRoute>
                            <ProblemDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/prep"
                    element={
                        <ProtectedRoute>
                            <Prep />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminTestCases />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;