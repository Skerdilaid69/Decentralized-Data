import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import CourseDetails from './pages/CourseDetails';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main search and list view [cite: 61, 68] */}
          <Route path="/" element={<SearchPage />} />
          {/* Course details page [cite: 72] */}
          <Route path="/courses/:id" element={<CourseDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;