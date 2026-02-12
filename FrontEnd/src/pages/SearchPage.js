import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const styles = {
  container: {
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
    backgroundColor: '#f9f9f9'
  },
  header: {
    borderBottom: '2px solid #007bff',
    marginBottom: '30px',
    paddingBottom: '20px'
  },
  title: {
    fontSize: '2.5rem',
    color: '#007bff',
    textAlign: 'center',
    fontFamily: '"Comic Sans MS", "Apple Chancery", cursive',
    transform: 'skewY(-2deg)',
    fontWeight: 'bold',
    textShadow: '5px 5px 0px rgba(0, 123, 255, 0.15)',
    marginBottom: '30px'
  },
  actionRow: {
    marginBottom: '20px',
    display: 'flex',
    gap: '15px',
    justifyContent: 'flex-start'
  },
  syncButton: {
    padding: '10px 20px',
    backgroundColor: '#48cef0',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  analyticsButton: {
    padding: '10px 20px',
    backgroundColor: '#6f42c1', // Purple
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginTop: '20px'
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #007bff'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '25px'
  },
  card: {
    border: '1px solid #007bff',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  cardTitle: {
    color: '#007bff',
    marginBottom: '10px',
    fontSize: '1.2rem'
  },
  cardMeta: {
    margin: '5px 0',
    fontSize: '0.9rem',
    color: '#555'
  },
  cardDesc: {
    color: '#666',
    fontSize: '0.9rem',
    lineHeight: '1.4',
    marginTop: '10px'
  },
  detailsButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%',
    marginTop: '15px'
  },
  noResults: {
    textAlign: 'center',
    gridColumn: '1 / -1',
    padding: '50px',
    color: '#007bff'
  },
  statusMsg: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#666'
  },
  pagination: {
    marginTop: '40px',
    paddingBottom: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px'
  },
  pageButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
    color: '#888',
    cursor: 'not-allowed'
  },
  pageInfo: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#555'
  }
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const SearchPage = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('');
  const [level, setLevel] = useState('');
  const [providerId, setProviderId] = useState('');
  const [category, setCategory] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedCategory = useDebounce(category, 500);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchCourses = async () => {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams({
        search: debouncedSearch,
        language: language,
        level: level,
        provider_id: providerId,
        category: debouncedCategory,
        page: page,     
        limit: 12       
      }).toString();

      try {
        const response = await fetch(`http://localhost:5001/api/courses?${query}`, { signal });
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
            setCourses(data.data);               
            setTotalPages(data.meta.totalPages); 
        } else if (Array.isArray(data)) {
            setCourses(data); 
        } else {
            setCourses([]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          console.error('Fetch error:', err);
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    fetchCourses();
    return () => controller.abort();
  }, [debouncedSearch, language, level, providerId, debouncedCategory, page, refreshTrigger]); 

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/sync/all`);
      const data = await response.json();
      alert(data.message || "Sync started!");
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      alert("Sync failed: " + error.message);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
   <div style={styles.container}>
      <header style={styles.header}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={styles.title}>myCourses</h1>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/dashboard">
            <button style={styles.pageButton}>My Dashboard</button>
          </Link>
          
          <button 
            onClick={handleLogout} 
            style={{ ...styles.pageButton, backgroundColor: '#dc3545' }}
          >
            Logout
          </button>
        </div>
      </div>

        <div style={styles.actionRow}>
          <button 
            onClick={handleSync} 
            disabled={loading} 
            style={styles.syncButton}
          >
            <span>{loading ? '⏳' : '🔄'}</span> {loading ? 'Syncing...' : 'Sync Data'}
          </button>

          <button 
            onClick={() => navigate('/analytics')} 
            style={styles.analyticsButton}
          >
            <span>📊</span> View Analytics
          </button>
        </div>

        <div style={styles.filterGrid}>
          <input 
            type="text" 
            placeholder="Search by title..." 
            style={styles.input}
            value={searchTerm}
            onChange={handleFilterChange(setSearchTerm)} 
          />

          <select value={language} onChange={handleFilterChange(setLanguage)} style={styles.input}>
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="ar">Arabic</option>
            <option value="zh-CN,zh-TW">Chinese</option>
            <option value="ru">Russian</option>
          </select>

          <select value={level} onChange={handleFilterChange(setLevel)} style={styles.input}>
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select value={providerId} onChange={handleFilterChange(setProviderId)} style={styles.input}>
            <option value="">All Sources</option>
            <option value="1">Microsoft Learn</option>
            <option value="2">Coursera</option>
          </select>

          <input 
            type="text" 
            placeholder="Category (e.g. azure)..." 
            style={styles.input}
            value={category}
            onChange={handleFilterChange(setCategory)}
          />
        </div>
      </header>

      <div style={styles.grid}>
        {loading && courses.length === 0 ? (
          <p style={styles.statusMsg}>Loading courses...</p>
        ) : error ? (
          <p style={{...styles.statusMsg, color: 'red'}}>Error: {error}</p>
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} style={styles.card}>
              <div>
                  <h3 style={styles.cardTitle}>{course.title}</h3>
                  <p style={styles.cardMeta}>
                    <strong>Source:</strong> {course.source_name || "Microsoft Learn"}
                  </p> 
                  <p style={styles.cardMeta}>
                    <strong>Level:</strong> {course.level}
                  </p>
                  <p style={styles.cardDesc}>
                    {course.description ? `${course.description.substring(0, 100)}...` : 'No description available.'}
                  </p>
              </div>
              <button 
                onClick={() => navigate(`/courses/${course.id}`)}
                style={styles.detailsButton}
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <div style={styles.noResults}>
            <h3>No courses found.</h3>
          </div>
        )}
      </div>

      <div style={styles.pagination}>
        <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1}
            style={{ ...styles.pageButton, ...(page === 1 ? styles.disabledButton : {}) }}
        >
            &lt; Previous
        </button>
        
        <span style={styles.pageInfo}>
            Page {page} of {totalPages}
        </span>

        <button 
            onClick={() => setPage(p => (p < totalPages ? p + 1 : p))} 
            disabled={page === totalPages || totalPages === 0}
            style={{ ...styles.pageButton, ...(page === totalPages || totalPages === 0 ? styles.disabledButton : {}) }}
        >
            Next &gt;
        </button>
      </div>
      
    </div>
  );
};

export default SearchPage;