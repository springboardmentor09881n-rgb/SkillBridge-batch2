import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./components/Login";
import Register from "./components/Register";
import ProfileNGO from "./components/ProfileNGO";
import ProfileVolunteer from "./components/ProfileVolunteer";

import VolunteerDashboard from "./pages/VolunteerDashboard";
import NGODashboard from "./pages/NGODashboard";
import EditProfileVolunteer from "./pages/EditProfileVolunteer";
import EditProfileNGO from "./pages/EditProfileNGO";
import CreateOpportunity from "./pages/CreateOpportunity";
import ManageOpportunities from "./pages/ManageOpportunities";
import LandingPage from "./pages/LandingPage";
import VolunteerOpportunities from "./pages/VolunteerOpportunities";
import VolunteerApplications from "./pages/VolunteerApplications";
import VolunteerMessages from "./pages/VolunteerMessages";
import OpportunityDetail from "./pages/OpportunityDetail";
import CreateNewOpportunity from "./pages/CreateNewopportunity";


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
