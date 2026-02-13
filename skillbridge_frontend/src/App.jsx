import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Register from "./components/Register";
import ProfileForm from "./components/ProfileForm";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/profile" element={<ProfileForm />} />
      </Routes>
    </Router>
  );
};

export default App;


