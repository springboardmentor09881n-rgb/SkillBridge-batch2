import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import ProfileNGO from "./components/ProfileNgo";
import ProfileVolunteer from "./components/ProfileVolunteer";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/profile-ngo" element={<ProfileNGO />} />
        <Route path="/profile-volunteer" element={<ProfileVolunteer />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;


