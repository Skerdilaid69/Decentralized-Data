import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SearchPage = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('');
  const [level, setLevel] = useState('');
  const [providerId, setProviderId] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams({
      search: searchTerm,
      language: language,
      level: level,
      provider_id: providerId,
      category: category
    }).toString();

    fetch(`http://localhost:5001/api/courses?${query}`)
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((data) => {
        setCourses(Array.isArray(data) ? data : []);
      })
      .catch((error) => console.error('Error fetching courses:', error));
  }, [searchTerm, language, level, providerId, category]); 

  const handleSync = async (provider) => {
    try {
      const response = await fetch(`http://localhost:5001/api/sync/${provider}`);
      const data = await response.json();
      alert(data.message);
      window.location.reload(); 
    } catch (error) {
      alert("Sync failed: " + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ borderBottom: '2px solid #eee', marginBottom: '30px', paddingBottom: '20px' }}>
        
        {/* TOP ROW: Title + Right Side Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#333', margin: 0 }}>Course Aggregator</h1>
          
          {/* RIGHT SIDE CONTROLS CONTAINER */}
          <div style={{ display: 'flex', gap: '10px' }}>
            
            {/* 1. Dashboard Button */}
            <Link to="/dashboard">
              <button style={{ 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: '5px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold' 
              }}>
                My Dashboard
              </button>
            </Link>

            {/* 2. Logout Button */}
            <button 
              onClick={handleLogout} 
              style={{ 
                  backgroundColor: '#dc3545',
                  color: 'white', 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: '5px', 
                  cursor: 'pointer',
                  fontWeight: 'bold'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* SECOND ROW: Sync Buttons */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleSync('coursera')} 
            style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            🔄 Sync Coursera
          </button>
          <button 
            onClick={() => handleSync('edx')} 
            style={{ padding: '10px 20px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            🔄 Sync edX
          </button>
        </div>

        {/* THIRD ROW: Search Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
          <input 
            type="text" 
            placeholder="Search by title..." 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}>
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="el">Greek</option>
            <option value="fr">French</option>
            <option value="ar">Arabic</option>
          </select>
          <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}>
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <select value={providerId} onChange={(e) => setProviderId(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}>
            <option value="">All Sources</option>
            <option value="1">Coursera</option>
            <option value="2">edX</option>
          </select>
          <input 
            type="text" 
            placeholder="Category (e.g. CS)..." 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
      </header>

      {/* RESULTS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} style={{ border: '1px solid #ddd', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#fff' }}>
              <h3 style={{ color: '#007bff', marginBottom: '10px' }}>{course.title}</h3>
              <p><strong>Source:</strong> {course.source_name}</p> 
              <p><strong>Level:</strong> {course.level}</p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                {course.description ? `${course.description.substring(0, 100)}...` : 'No description.'}
              </p>
              <button 
                onClick={() => navigate(`/courses/${course.id}`)}
                style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', width: '100%', marginTop: '10px' }}
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '50px', color: '#888' }}>
            <h3>No courses found matching your criteria.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;