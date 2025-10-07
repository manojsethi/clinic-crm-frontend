import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConfigProvider } from "antd";
import { AuthProvider } from "./context/AuthContext";
import { RegistrationProvider } from "./context/RegistrationContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Registration } from "./pages/Registration";
import { QRScanner } from "./pages/QRScanner";
import { RegistrationSetup } from "./pages/RegistrationSetup";
import { Dashboard } from "./pages/Dashboard";
import { RegistrationManagement } from "./pages/RegistrationManagement";
import { UserManagement } from "./pages/UserManagement";
import "./App.css";
import Devices from "./pages/Devices";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 8,
        },
      }}
    >
      <AuthProvider>
        <RegistrationProvider>
          <Router>
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Navigate to="/dashboard" replace />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/registrations"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RegistrationManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/scan"
              element={
                <ProtectedRoute>
                  <QRScanner />
                </ProtectedRoute>
              }
            />

            <Route
              path="/registration-setup"
              element={
                <ProtectedRoute>
                  <RegistrationSetup />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <UserManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/devices"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <Devices />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </RegistrationProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
