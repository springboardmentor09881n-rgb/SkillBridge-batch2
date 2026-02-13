import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import ProfileForm from "./components/ProfileForm";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/profile" element={<ProfileForm />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;


