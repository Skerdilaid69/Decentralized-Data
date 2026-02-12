import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import CourseDetails from './pages/CourseDetails';
import Analytics from './pages/Analytics';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/analytics" element ={<Analytics />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;