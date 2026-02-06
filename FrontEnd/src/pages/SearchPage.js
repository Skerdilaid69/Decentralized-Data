import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('');
  const [level, setLevel] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Construct the query string for filtering based on user input
    const query = new URLSearchParams({
      search: searchTerm,
      language: language,
      level: level
    }).toString();

    // Fetching from your Node.js API (Port 5000)
    fetch(`http://localhost:5001/api/courses?${query}`)
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((data) => {
        // Ensure data is an array before setting state
        setCourses(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error('Error fetching courses:', error);
      });
  }, [searchTerm, language, level]); // Re-run whenever a filter changes

  const handleViewDetails = (id) => {
    // Navigates to the CourseDetails page using the course ID
    navigate(`/courses/${id}`);
  };

  return (
    <div className="search-page" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ borderBottom: '2px solid #eee', marginBottom: '30px', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#333', margin: '0' }}>Course Aggregator</h1>
        
        <div className="filters" style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
          {/* Requirement: Search by title/keywords */}
          <input 
            type="text" 
            placeholder="Search by title..." 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', flex: '2', fontSize: '1rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {/* Requirement: Filter by Language */}
          <select 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', flex: '1', cursor: 'pointer' }}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="">All Languages</option>
            <option value="English">English</option>
            <option value="Greek">Greek</option>
            <option value="Arabic">Arabic</option>
            <option value="French">French</option>
          </select>

          {/* Requirement: Filter by Level */}
          <select 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', flex: '1', cursor: 'pointer' }}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Advanced">Advanced</option>
            <option value="Intermediate">Intermediate</option>
          </select>
        </div>
      </header>

      {/* Requirement: Course List View (Grid Layout) */}
      <div className="course-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} className="course-card" style={{ 
              border: '1px solid #ddd', 
              borderRadius: '15px', 
              padding: '20px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ marginTop: '0', color: '#007bff', fontSize: '1.2rem' }}>{course.title}</h3>
                <p style={{ margin: '5px 0' }}><strong>Source:</strong> {course.source_name}</p>
                <p style={{ margin: '5px 0' }}><strong>Level:</strong> <span style={{ color: '#555' }}>{course.level}</span></p>
                <p style={{ color: '#777', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  {course.description ? `${course.description.substring(0, 80)}...` : 'No description provided.'}
                </p>
              </div>
              
              <button 
                onClick={() => handleViewDetails(course.id)}
                style={{ 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold', 
                  width: '100%', 
                  marginTop: '15px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '50px', color: '#888' }}>
            <h3>No courses found.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;