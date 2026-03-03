import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import Login from "./components/Login";
import ProfileNGO from "./components/ProfileNGO";
import ProfileVolunteer from "./components/ProfileVolunteer";
import Register from "./components/Register";

import CreateNewOpportunity from "./pages/CreateNewopportunity";
import CreateOpportunity from "./pages/CreateOpportunity";
import EditOpportunity from "./pages/EditOpportunity";
import EditProfileNGO from "./pages/EditProfileNGO";
import EditProfileVolunteer from "./pages/EditProfileVolunteer";
import LandingPage from "./pages/LandingPage";
import ManageOpportunities from "./pages/ManageOpportunities";
import NGOApplications from "./pages/NGOApplications";
import NGODashboard from "./pages/NGODashboard";
import NGOMessages from "./pages/NGOMessages";
import OpportunityDetail from "./pages/OpportunityDetail";
import VolunteerApplications from "./pages/VolunteerApplications";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import VolunteerMessages from "./pages/VolunteerMessages";
import VolunteerOpportunities from "./pages/VolunteerOpportunities";


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile-ngo" element={<ProfileNGO />} />
          <Route path="/profile-volunteer" element={<ProfileVolunteer />} />

          {/* Protected Routes - Volunteer */}
          <Route
            path="/volunteer-dashboard"
            element={<ProtectedRoute allowedRoles={["Volunteer"]}><VolunteerDashboard /></ProtectedRoute>}
          />
          <Route
            path="/edit-profile-volunteer"
            element={<ProtectedRoute allowedRoles={["Volunteer"]}><EditProfileVolunteer /></ProtectedRoute>}
          />
          <Route
            path="/volunteer-opportunities"
            element={<ProtectedRoute allowedRoles={["Volunteer"]}><VolunteerOpportunities /></ProtectedRoute>}
          />
          <Route
            path="/volunteer-applications"
            element={<ProtectedRoute allowedRoles={["Volunteer"]}><VolunteerApplications /></ProtectedRoute>}
          />
          <Route
            path="/volunteer-messages"
            element={<ProtectedRoute allowedRoles={["Volunteer"]}><VolunteerMessages /></ProtectedRoute>}
          />
          <Route
            path="/opportunity/:id"
            element={<OpportunityDetail />}
          />

          {/* Protected Routes - NGO */}
          <Route
            path="/ngo-dashboard"
            element={<ProtectedRoute allowedRoles={["NGO"]}><NGODashboard /></ProtectedRoute>}
          />
          <Route
            path="/edit-profile-ngo"
            element={<ProtectedRoute allowedRoles={["NGO"]}><EditProfileNGO /></ProtectedRoute>}
          />
          <Route
            path="/create-opportunity"
            element={<ProtectedRoute allowedRoles={["NGO"]}><CreateOpportunity /></ProtectedRoute>}
          />
          <Route
            path="/manage-opportunities"
            element={<ProtectedRoute allowedRoles={["NGO"]}><ManageOpportunities /></ProtectedRoute>}
          />
          <Route
            path="/edit-opportunity/:id"
            element={<ProtectedRoute allowedRoles={["NGO"]}><EditOpportunity /></ProtectedRoute>}
          />
          <Route
            path="/ngo-applications"
            element={<ProtectedRoute allowedRoles={["NGO"]}><NGOApplications /></ProtectedRoute>}
          />
          <Route
            path="/ngo-messages"
            element={<ProtectedRoute allowedRoles={["NGO"]}><NGOMessages /></ProtectedRoute>}
          />

          {/* Protected Routes - CreateNewopportunity*/}
          <Route
            path="/create-new-opportunity"
            element={<CreateNewOpportunity />}
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
