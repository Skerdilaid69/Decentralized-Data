import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Analytics = () => {
    const [stats, setStats] = useState({ byProvider: [], byLanguage: [], byCluster: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const primaryBlue = '#007bff';

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/analytics'); 
                
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("text/html")) {
                   throw new Error("Server returned HTML. Check Backend Port (5001).");
                }

                if (!response.ok) throw new Error('Failed to fetch analytics data');
                
                const data = await response.json();
                setStats(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <div style={{ color: primaryBlue, padding: '40px', textAlign: 'center' }}>Loading Analytics...</div>;
    if (error) return <div style={{ color: 'red', padding: '40px', textAlign: 'center' }}>Error: {error}</div>;

    return (
        <div className="analytics-page" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            
            <div style={{ marginBottom: '20px' }}>
                <Link 
                    to="/"  
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#555', textDecoration: 'none', fontWeight: '500', padding: '8px 12px', borderRadius: '6px', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#007bff'; e.currentTarget.style.color = '#333'; }} // Subtle hover effect
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#555'; }}
                >
                    <span>←</span> Back to Search
                </Link>
            </div>

            <h1 style={{ color: primaryBlue, marginTop: '0' }}>Course Repository Analytics</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Insights generated from aggregated metadata and Spark ML processing.
            </p>

            <div style={gridStyle}>
                <section style={cardStyle}>
                    <h3 style={headerStyle}>Courses per Source</h3>
                    <ul style={listStyle}>
                        {stats.byProvider && stats.byProvider.map((item, index) => (
                            <li key={index} style={listItemStyle}>
                                <strong>{item.label}:</strong> {item.value} courses 
                            </li>
                        ))}
                    </ul>
                </section>

                
                <section style={cardStyle}>
                    <h3 style={headerStyle}>Language Diversity</h3>
                    <ul style={listStyle}>
                        {stats.byLanguage && stats.byLanguage.map((item, index) => (
                            <li key={index} style={listItemStyle}>
                                <strong>{item.label}:</strong> {item.value} courses
                            </li>
                        ))}
                    </ul>
                </section>

                <section style={{ ...cardStyle, gridColumn: '1 / -1' }}>
                    <h3 style={headerStyle}>Spark ML: Thematic Clusters</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        Grouping of courses based on content similarity using Spark MLlib.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '15px' }}>
                        {stats.byCluster && stats.byCluster.map((cluster, index) => (
                            <div key={index} style={clusterBadgeStyle}>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Cluster ID</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{cluster.label}</div>
                                <div style={{ fontSize: '0.9rem' }}>{cluster.value} Courses</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '30px'
};

const cardStyle = {
    backgroundColor: '#fff',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
};

const headerStyle = {
    color: '#007bff',
    marginTop: 0,
    borderBottom: '2px solid #007bff',
    paddingBottom: '10px',
    fontSize: '1.25rem'
};

const listStyle = { listStyle: 'none', padding: 0 };
const listItemStyle = { padding: '10px 0', borderBottom: '1px solid #f1f1f1', fontSize: '1rem', color: '#333' };

const clusterBadgeStyle = {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '15px',
    borderRadius: '10px',
    minWidth: '120px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

export default Analytics;   