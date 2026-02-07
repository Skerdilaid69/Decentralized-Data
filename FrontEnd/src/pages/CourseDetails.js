import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5001/api/courses/${id}`)
      .then(res => res.json())
      .then(data => setCourse(data));
  }, [id]);

  if (!course) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading course details...</p>
    </div>
  );

  return (
    <div className="details-page-wrapper" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="container">
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>← Back to Search</Link>
        
        <header className="details-header" style={{ marginTop: '20px' }}>
          <h1 style={{ fontSize: '2.2rem' }}>{course.title}</h1>
          <div className="meta-tags" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <span style={{ padding: '5px 12px', backgroundColor: '#e9ecef', borderRadius: '20px', fontSize: '0.85rem' }}>{course.source_name}</span>
            <span style={{ padding: '5px 12px', backgroundColor: '#007bff', color: 'white', borderRadius: '20px', fontSize: '0.85rem' }}>{course.level}</span>
            <span style={{ padding: '5px 12px', backgroundColor: '#6c757d', color: 'white', borderRadius: '20px', fontSize: '0.85rem' }}>{course.language}</span>
          </div>
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