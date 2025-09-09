import { Route, Routes } from "react-router-dom";
import "./App.css";
import RegisterPage from "./pages/Register";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

import HRDashboard from "./pages/HR/HRDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";

import TotalDataPage from "./pages/HR/TotalDataPage";
import ActivePositions from "./pages/Admin/ActivePositions";
import HRVacancy from "./pages/HR/HRVacancy";
import CandidateForm from "./pages/HR/Candidates";
import ActiveListPage from "./pages/HR/ActiveListPage";
import ApprovalsPage from "./pages/Admin/ApprovalsPage";
import RejectedDataPage from "./pages/HR/RejectedPage";
import TotalMasterDataPage from "./pages/HR/TotalMasterDataPage";
import AboutToJoinPage from "./pages/HR/AboutToJoinPage";
import NewlyJoinedPage from "./pages/HR/NewlyJoinedPage";
import BufferDataPage from "./pages/HR/BufferDataPage";
import AssignToHrPage from "./pages/Admin/AssignToHrPage";
import HRPage from "./pages/Admin/HRPage";
import HRDataTrackerPage from "./pages/Admin/HRDataTrackerPage";
import UploadPage from "./pages/HR/UploadPage";
import Unauthorized from "./components/Unauthorized";
import { HRProvider } from "./components/HRContext";
import { AdminProvider } from "./components/AdminContext";

function App() {
  return (
    <HRProvider>
      <AdminProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* HR Protected Routes */}
          <Route
            path="/hr-dashboard"
            element={
              <ProtectedRoute role="HR">
                <HRDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr-dashboard/vacancies"
            element={
              <ProtectedRoute role="HR">
                <HRVacancy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr-dashboard/add-candidate"
            element={
              <ProtectedRoute role="HR">
                <CandidateForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr-dashboard/active-list"
            element={
              <ProtectedRoute role="HR">
                <ActiveListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr-dashboard/upload"
            element={
              <ProtectedRoute role="HR">
                <UploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/total-data"
            element={
              <ProtectedRoute role="HR">
                <TotalDataPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/total-data/rejected-data"
            element={
              <ProtectedRoute role="HR">
                <RejectedDataPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/total-data/total-master-data"
            element={
              <ProtectedRoute role="HR">
                <TotalMasterDataPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/total-data/about-to-join"
            element={
              <ProtectedRoute role="HR">
                <AboutToJoinPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/total-data/newly-joined"
            element={
              <ProtectedRoute role="HR">
                <NewlyJoinedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/total-data/buffer-data"
            element={
              <ProtectedRoute role="HR">
                <BufferDataPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="Admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard/active-positions"
            element={
              <ProtectedRoute role="Admin">
                <ActivePositions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard/approvals"
            element={
              <ProtectedRoute role="Admin">
                <ApprovalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard/hr-list"
            element={
              <ProtectedRoute role="Admin">
                <HRPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard/assign-to-hr"
            element={
              <ProtectedRoute role="Admin">
                <AssignToHrPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard/hr-data-tracker"
            element={
              <ProtectedRoute role="Admin">
                <HRDataTrackerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard/upload"
            element={
              <ProtectedRoute role="Admin">
                <UploadPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </AdminProvider>
    </HRProvider>
  );
}

export default App;
