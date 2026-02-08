import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/courses/${id}`);
        const data = await res.json();
        setCourse(data);
        setLoading(false);

        const token = localStorage.getItem('token');
        if (token) {
            const authHeaders = { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            };

            fetch('http://localhost:5001/api/history', {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ courseId: id })
            });

            const bookmarkRes = await fetch(`http://localhost:5001/api/bookmarks/${id}`, {
                method: 'GET',
                headers: authHeaders
            });
            const bookmarkData = await bookmarkRes.json();
            setIsBookmarked(bookmarkData.isBookmarked); 
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleBookmark = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert("Please login to save courses!");
      navigate('/auth');
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/bookmarks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ courseId: id })
      });

      const data = await res.json();
      
      if (res.ok) {
        setIsBookmarked(data.isBookmarked); 
      }
    } catch (err) {
      console.error("Bookmark failed:", err);
    }
  };

  if (loading || !course) return (
    <div className="loading-container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <div className="spinner"></div>
      <p>Loading course details...</p>
    </div>
  );

  return (
    <div className="details-page-wrapper" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="container">
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>← Back to Search</Link>
        
        <header className="details-header" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>{course.title}</h1>
            <div className="meta-tags" style={{ display: 'flex', gap: '10px' }}>
              <span style={{ padding: '5px 12px', backgroundColor: '#e9ecef', borderRadius: '20px', fontSize: '0.85rem' }}>{course.source_name || 'Online'}</span>
              <span style={{ padding: '5px 12px', backgroundColor: '#007bff', color: 'white', borderRadius: '20px', fontSize: '0.85rem' }}>{course.level}</span>
              <span style={{ padding: '5px 12px', backgroundColor: '#6c757d', color: 'white', borderRadius: '20px', fontSize: '0.85rem' }}>{course.language}</span>
            </div>
          </div>

          <button 
            onClick={handleBookmark}
            style={{
              background: 'none',
              border: '1px solid #ddd',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              cursor: 'pointer',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              color: isBookmarked ? '#e74c3c' : '#ccc',
              transition: 'all 0.2s'
            }}
            title={isBookmarked ? "Remove from Bookmarks" : "Save to Bookmarks"}
          >
            {isBookmarked ? '♥' : '♡'}
          </button>
        </header>

        <main className="details-content" style={{ marginTop: '30px' }}>
          <section className="description-section">
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Description</h3>
            <p style={{ lineHeight: '1.6', color: '#444' }}>{course.description}</p>
          </section>

          <section className="cta-section" style={{ marginTop: '30px' }}>
            <a href={course.url} target="_blank" rel="noreferrer">
              <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}>
                Register / Access Course
              </button>
            </a>
          </section>
        </main>

        <footer className="recommendations-section" style={{ marginTop: '50px' }}>
          <hr style={{ border: '0', borderTop: '1px solid #eee' }} />
          <h3>Recommended Similar Courses</h3>
          <div className="recommendation-list" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '20px' }}>
            {course.recommendations && course.recommendations.length > 0 ? (
              course.recommendations.map(rec => (
                <Link 
                  key={rec.id} 
                  to={`/courses/${rec.id}`} 
                  style={{ textDecoration: 'none', padding: '12px', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: '#f8f9fa', color: '#333', fontSize: '0.9rem' }}
                >
                  <strong>{rec.title}</strong>
                  <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px' }}>Source: {rec.source_name}</div>
                </Link>
              ))
            ) : (
              <p style={{ color: '#888' }}>No recommendations available yet.</p>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CourseDetails;