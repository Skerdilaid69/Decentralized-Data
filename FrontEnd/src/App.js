import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Added Navigate
import SearchPage from './pages/SearchPage';
import CourseDetails from './pages/CourseDetails';
import Analytics from './pages/Analytics';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import './App.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/auth" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/analytics" element ={<Analytics />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <SearchPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/courses/:id" 
            element={
              <PrivateRoute>
                <CourseDetails />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<SearchPage />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/analytics" element ={<Analytics />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;