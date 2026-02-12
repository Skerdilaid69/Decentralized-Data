import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
  const [courses, setCourses] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('');
  const [level, setLevel] = useState('');
  const [providerId, setProviderId] = useState('');
  const [category, setCategory] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams({
      search: searchTerm,
      language: language,
      level: level,
      provider_id: providerId,
      category: category,
      page: page,     
      limit: 12       
    }).toString();

    fetch(`http://localhost:5001/api/courses?${query}`)
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
            setCourses(data.data);               
            setTotalPages(data.meta.totalPages); 
        } else if (Array.isArray(data)) {
            setCourses(data); 
        } else {
            setCourses([]);
        }
      })
      .catch((error) => console.error('Error fetching courses:', error));
  }, [searchTerm, language, level, providerId, category, page]); 

  const handleSync = async (provider) => {
    try {
      const response = await fetch(`http://localhost:5001/api/sync/${provider}`);
      const data = await response.json();
      alert(data.message || "Sync started!");
      window.location.reload(); 
    } catch (error) {
      alert("Sync failed: " + error.message);
    }
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
   <div style={{ padding: '40px', 
  maxWidth: '1200px', 
  margin: '0 auto', 
  fontFamily: 'Arial, sans-serif',
  minHeight: '100vh' }}>
  <header style={{ borderBottom: '2px solid #007bff', marginBottom: '30px', paddingBottom: '20px' }}>
    <h1 style={{ 
      fontSize: '2.5rem', 
      color: '#007bff', 
      textAlign: 'center',
      fontFamily: '"Comic Sans MS", "Apple Chancery", cursive',
      transform: 'skewY(-2deg)',
      fontWeight: 'bold',
      /* This creates a "font behind a font" look */
      textShadow: '5px 5px 0px rgba(0, 123, 255, 0.15)' 
    }}>
      myCourses
    </h1>
        
        <div style={{ marginBottom: '20px' }}>
          <button   
            onClick={() => handleSync('microsoft')} 
            style={{ 
                padding: '10px 20px', 
                backgroundColor: '#5c2d91', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}
          >
            <span>🔄</span> Sync Microsoft Data
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
          
          <input 
            type="text" 
            placeholder="Search by title..." 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #007bff' }}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} 
          />

          <select value={language} onChange={(e) => { setLanguage(e.target.value); setPage(1); }} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #007bff' }}>
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="ar">Arabic</option>
            <option value="zh-CN,zh-TW">Chinese</option>
            <option value="ru">Russian</option>
          </select>

          <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #007bff' }}>
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select value={providerId} onChange={(e) => { setProviderId(e.target.value); setPage(1); }} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #007bff' }}>
            <option value="">All Sources</option>
            <option value="1">Microsoft Learn</option>
            <option value="2">Coursera</option>
          </select>

          <input 
            type="text" 
            placeholder="Category (e.g. azure)..." 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #007bff' }}
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          />

        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} style={{ border: '1px solid #007bff', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                  <h3 style={{ color: '#007bff', marginBottom: '10px', fontSize: '1.2rem' }}>{course.title}</h3>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#555' }}>
                    <strong>Source:</strong> {course.source_name || "Microsoft Learn"}
                  </p> 
                  <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#555' }}>
                    <strong>Level:</strong> {course.level}
                  </p>
                  <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.4', marginTop: '10px' }}>
                    {course.description ? `${course.description.substring(0, 100)}...` : 'No description available.'}
                  </p>
              </div>
              <button 
                onClick={() => navigate(`/courses/${course.id}`)}
                style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', width: '100%', marginTop: '15px' }}
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '50px', color: '#007bff' }}>
            <h3>No courses found.</h3>
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px', paddingBottom: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <button 
            onClick={handlePrev} 
            disabled={page === 1}
            style={{ 
                padding: '10px 20px', 
                backgroundColor: page === 1 ? '#e0e0e0' : '#007bff', 
                color: page === 1 ? '#888' : 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: page === 1 ? 'not-allowed' : 'pointer' 
            }}
        >
            &lt; Previous
        </button>
        
        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#555' }}>
            Page {page} of {totalPages}
        </span>

        <button 
            onClick={handleNext} 
            disabled={page === totalPages || totalPages === 0}
            style={{ 
                padding: '10px 20px', 
                backgroundColor: (page === totalPages || totalPages === 0) ? '#e0e0e0' : '#007bff', 
                color: (page === totalPages || totalPages === 0) ? '#888' : 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer' 
            }}
        >
            Next &gt;
        </button>
      </div>
      
    </div>
  );
};

export default SearchPage;