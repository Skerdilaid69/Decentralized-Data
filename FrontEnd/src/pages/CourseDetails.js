import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5001/api/courses/${id}`)
      .then(res => res.json())
      .then(data => setCourse(data))
      .catch(err => console.error(err));

    setLoadingRecs(true);
    fetch(`http://localhost:5001/api/courses/${id}/similar`)
      .then(res => res.json())
      .then(data => {
        setRecommendations(data);
        setLoadingRecs(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingRecs(false);
      });
  }, [id]);

  if (!course) return <div style={{ padding: '40px' }}>Loading course details...</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <Link 
  to="/"  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#555', textDecoration: 'none', fontWeight: '500',padding: '8px 12px',borderRadius: '6px',transition: 'background-color 0.2s'}}
  onMouseEnter={(e) => e.target.style.backgroundColor = '#007bff'}
  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}><span>←</span> Back to Search</Link>
      <h1 style={{ color: '#007bff' }}>{course.title}</h1>
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        <span style={{ padding: '5px 12px', backgroundColor: '#e9ecef', borderRadius: '20px' }}>{course.source_name}</span>
        <span style={{ padding: '5px 12px', backgroundColor: '#007bff', color: 'white', borderRadius: '20px' }}>{course.level}</span>
      </div>
      <p style={{ lineHeight: '1.6' }}>{course.description}</p>
      <a href={course.url} target="_blank" rel="noreferrer">
        <button style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Access Course</button>
      </a>

      <div style={{ marginTop: '50px' }}>
        <hr />
        <h3>Recommended Similar Courses</h3>
        {loadingRecs ? (
          <div style={{ padding: '20px', backgroundColor: '#fff3cd', color: '#007bff' }}>
            ⏳ Spark is processing recommendations. Please wait...
          </div>
        ) : recommendations.length > 0 ? (
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '20px' }}>
            {recommendations.map(rec => (
              <Link key={rec.id} to={`/courses/${rec.id}`} style={{ padding: '15px', border: '1px solid #007bff', borderRadius: '10px', textDecoration: 'none', color: '#333' }}>
                <strong>{rec.title}</strong>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>Source: {rec.source_name}</div>
              </Link>
            ))}
          </div>
        ) : (
          <p>No recommendations available yet.</p>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;