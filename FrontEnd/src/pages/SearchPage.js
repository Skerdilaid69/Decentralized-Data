import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('');
  const [level, setLevel] = useState('');
  const [providerId, setProviderId] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  // Λειτουργία αναζήτησης που καλείται από το κουμπί ή αυτόματα [cite: 61, 101]
  const fetchCourses = () => {
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
  };

  // Αρχικό φόρτωμα δεδομένων [cite: 104]
  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSearchClick = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ borderBottom: '2px solid #eee', marginBottom: '30px', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#333' }}>Course Aggregator</h1>
        
        {/* Φόρμα Φίλτρων Αναζήτησης [cite: 61] */}
        <form onSubmit={handleSearchClick} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginTop: '20px' }}>
          
          {/* Αναζήτηση βάσει τίτλου/λέξεων-κλειδιών  */}
          <input 
            type="text" 
            placeholder="Search by title or keywords..." 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {/* Φιλτράρισμα βάσει γλώσσας [cite: 64] */}
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}>
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="el">Greek</option>
            <option value="fr">French</option>
            <option value="ar">Arabic</option>
          </select>

          {/* Φιλτράρισμα βάσει επιπέδου [cite: 65] */}
          <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}>
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {/* Φιλτράρισμα βάσει πηγής repository [cite: 66] */}
          <select value={providerId} onChange={(e) => setProviderId(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}>
            <option value="">All Sources</option>
            <option value="1">Coursera</option>
            <option value="2">edX</option>
          </select>

          {/* Φιλτράρισμα βάσει θεματικής περιοχής [cite: 67] */}
          <input 
            type="text" 
            placeholder="Category (e.g. Data Science)..." 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <button 
            type="submit"
            style={{ backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Search
          </button>
        </form>
      </header>

      {/* Προβολή λίστας μαθημάτων [cite: 68] */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} style={{ border: '1px solid #ddd', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#fff' }}>
              <h3 style={{ color: '#007bff', marginBottom: '10px' }}>{course.title}</h3>
              <p><strong>Source:</strong> {course.source_name}</p> {/* Ένδειξη πηγής  */}
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
            <h3>No courses found.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;