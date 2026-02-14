import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const endpoint = isLogin ? '/login' : '/register';
    const url = `http://localhost:5001/api${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          navigate('/'); 
        } else {
          setMessage('✅ Registration successful! Please log in.');
          setIsLogin(true);
        }
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Server error. Is the Backend running?');
    }
  };

  const styles = {
    wrapper: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#4fa0f6ff', 
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: '20px'
    },
    card: {
      backgroundColor: '#7de2f2ff',
      width: '100%',
      maxWidth: '420px', 
      padding: '40px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', 
      textAlign: 'center'
    },
    header: {
      marginBottom: '30px'
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
    pill: {
      display: 'inline-block',
      padding: '6px 16px',
      backgroundColor: '#e7f5ff',
      color: '#007bff',
      borderRadius: '50px',
      fontSize: '0.85rem',
      fontWeight: '600',
      letterSpacing: '0.5px'
    },
    sectionTitle: {
      fontSize: '1.1rem',
      color: '#555',
      marginBottom: '25px',
      fontWeight: '500'
    },
    inputGroup: {
      marginBottom: '20px',
      textAlign: 'left'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#343a40'
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      border: '1px solid #ced4da',
      borderRadius: '8px',
      fontSize: '1rem',
      backgroundColor: '#f8f9fa',
      outline: 'none',
      transition: 'all 0.2s',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '10px',
      transition: 'background-color 0.2s',
      boxShadow: '0 4px 6px rgba(0, 123, 255, 0.2)'
    },
    msgBox: {
      marginTop: '20px',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '0.95rem',
      lineHeight: '1.4'
    },
    footer: {
      marginTop: '25px',
      paddingTop: '20px',
      borderTop: '1px solid #eee',
      fontSize: '0.95rem',
      color: '#6c757d'
    },
    link: {
      color: '#007bff',
      cursor: 'pointer',
      fontWeight: '600',
      marginLeft: '5px',
      textDecoration: 'none'
    }
  };

  return (
    <div className="auth-page-wrapper" style={styles.wrapper}>
      <div className="container" style={styles.card}>
        
                <header className="auth-header" style={styles.header}>
          <h1 style={styles.title}>
            {isLogin ? 'myCourses' : 'Create Account'}
          </h1>
          <div className="meta-tags">
            <span style={styles.pill}>
              {isLogin ? 'Secure Login' : 'New Member'}
            </span>
          </div>
        </header>
        <main className="auth-content">
          <section className="description-section">
            <h3 style={styles.sectionTitle}>
              {isLogin ? '' : 'Fill in your details'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              
              {!isLogin && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Username</label>
                  <input 
                    type="text" 
                    name="username" 
                    placeholder="Choose a username" 
                    value={formData.username} 
                    onChange={handleChange} 
                    required 
                    style={styles.input}
                  />
                </div>
              )}

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="name@example.com" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Enter your password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  style={styles.input}
                />
              </div>

              <button type="submit" style={styles.button}>
                {isLogin ? 'Login to Dashboard' : 'Register Account'}
              </button>
            </form>

            {message && (
              <div style={{
                ...styles.msgBox,
                backgroundColor: message.includes('❌') ? '#ffebee' : '#e8f5e9',
                color: message.includes('❌') ? '#c62828' : '#2e7d32'
              }}>
                {message}
              </div>
            )}
          </section>

          <footer style={styles.footer}>
            <p>
              {isLogin ? "Don't have an account yet?" : "Already have an account?"}
              <span 
                onClick={() => setIsLogin(!isLogin)} 
                style={styles.link}
              >
                {isLogin ? 'Register here' : 'Login here'}
              </span>
            </p>
          </footer>

        </main>
      </div>
    </div>
  );
};

export default Auth;