import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('bookmarks');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        const endpoint = activeTab === 'bookmarks' ? '/bookmarks' : '/history';
        const res = await fetch(`http://localhost:5001/api${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, navigate]);

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
    <Link 
    to="/"  
    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#555', textDecoration: 'none', fontWeight: '500', padding: '8px 12px', borderRadius: '6px', transition: 'background-color 0.2s' }}
    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#007bff'; e.currentTarget.style.color = '#333'; }} // Subtle hover effect
    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#555'; }}>
    <span>←</span> Back to Search
    </Link>                                    
      
      <h1 style={{ marginTop: '20px' }}>My Learning Dashboard</h1>

      <div style={{ display: 'flex', gap: '20px', margin: '30px 0', borderBottom: '1px solid #ddd' }}>
        <button 
          onClick={() => setActiveTab('bookmarks')}
          style={{ 
            padding: '10px 20px', 
            border: 'none', 
            background: 'none', 
            borderBottom: activeTab === 'bookmarks' ? '3px solid #007bff' : '3px solid transparent',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1.1rem',
            color: activeTab === 'bookmarks' ? '#007bff' : '#666'
          }}
        >
          ♥ Bookmarked Courses
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          style={{ 
            padding: '10px 20px', 
            border: 'none', 
            background: 'none', 
            borderBottom: activeTab === 'history' ? '3px solid #007bff' : '3px solid transparent',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1.1rem',
            color: activeTab === 'history' ? '#007bff' : '#666'
          }}
        >
          🕒 Watch History
        </button>
      </div>

      {/* CONTENT LIST */}
      {loading ? <p>Loading...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {items.length === 0 ? (
            <p style={{ color: '#888' }}>No courses found in this list.</p>
          ) : (
            items.map(course => (
              <div key={course.id} style={{ border: '1px solid #eee', borderRadius: '10px', padding: '15px', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <Link to={`/courses/${course.id}`} style={{ textDecoration: 'none', color: '#333' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 10px 0' }}>{course.title}</h3>
                </Link>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px' }}>
                  {course.source_name} • {course.level}
                </div>
                {activeTab === 'history' && (
                   <div style={{ fontSize: '0.75rem', color: '#999' }}>Viewed: {new Date(course.viewed_at).toLocaleDateString()}</div>
                )}
                 <Link to={`/courses/${course.id}`}>
                    <button style={{ width: '100%', marginTop: '10px', padding: '8px', backgroundColor: '#e7f3ff', color: '#007bff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        View Again
                    </button>
                 </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;