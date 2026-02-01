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
    <div className="details-page-wrapper">
      <div className="container">
        <Link to="/" className="back-link">← Back to Search</Link>
        
        <header className="details-header">
          <h1>{course.title}</h1>
          <div className="meta-tags">
            <span className="badge source-badge">{course.source_name}</span>
            <span className={`badge level-badge ${course.level.toLowerCase()}`}>{course.level}</span>
            <span className="badge lang-badge">{course.language}</span>
          </div>
        </header>

        <main className="details-content">
          <section className="description-section">
            <h3>Description</h3>
            <p>{course.description}</p>
          </section>

          <section className="cta-section">
            <a href={course.source_url} target="_blank" rel="noreferrer">
              <button className="register-button">Register / Access Course</button>
            </a>
          </section>
        </main>

        <footer className="recommendations-section">
  <hr />
  <h3>Recommended Similar Courses</h3>
  <div className="recommendation-list" style={{ display: 'flex', gap: '10px' }}>
    {course.recommendations && course.recommendations.map(rec => (
      <Link key={rec.id} to={`/courses/${rec.id}`} className="badge source-badge" style={{ textDecoration: 'none' }}>
        {rec.title}
      </Link>
    ))}
  </div>
</footer>
      </div>
    </div>
  );
};

export default CourseDetails;