import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./Login.js"
import Register from "./Register.js"
import Dashboard from "./Dashboard.js"
import User_profile from "./User_profile.js"
import Post from "./Post.js"
import User from "./User.js"

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={document.cookie ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route exact path="/login" element={document.cookie ? <Navigate to="/dashboard" /> : <Login />} />
        <Route exact path="/register" element={document.cookie ? <Navigate to="/dashboard" /> : <Register />} />
        <Route exact path="/dashboard" element={document.cookie ? <Dashboard /> : <Navigate to="/login" />} />
        <Route exact path="/profile" element={document.cookie ? <User_profile /> : <Navigate to="/login" />} />
        <Route exact path="/user/:id" element={document.cookie ? <User /> : <Navigate to="/login" />} />
        <Route exact path="/post/:id" element={document.cookie ? <Post /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;