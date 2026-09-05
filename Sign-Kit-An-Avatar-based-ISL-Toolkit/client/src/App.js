import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';

// Components & Pages
import Navbar from './Components/Navbar';
import Login from './Pages/Login';
import CreateAccount from './Pages/CreateAccount';
import Home from './Pages/Home';
import Convert from './Pages/Convert';
import SignToText from './Pages/SignToText';
import LearnSign from './Pages/LearnSign';
import Feedback from './Pages/Feedback';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<CreateAccount />} />

          {/* Dedicated Protected Page Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Navbar />
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/convert"
            element={
              <ProtectedRoute>
                <Navbar />
                <Convert />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sign-to-text"
            element={
              <ProtectedRoute>
                <Navbar />
                <SignToText />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn"
            element={
              <ProtectedRoute>
                <Navbar />
                <LearnSign />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <Navbar />
                <Feedback />
              </ProtectedRoute>
            }
          />

          {/* Default Route Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;