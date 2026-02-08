import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Removed 'Link' from imports since we don't use it anymore

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

  return (
    <div className="auth-page-wrapper" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh', background: 'white' }}>
      <div className="container">
        
        {/* HEADER - Updated Text */}
        <header className="auth-header" style={{ marginTop: '20px', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2.2rem', color: '#333' }}>
            {isLogin ? 'Welcome' : 'Create Account'}
          </h1>
          <div className="meta-tags" style={{ marginTop: '10px' }}>
            <span style={{ padding: '5px 12px', backgroundColor: '#e9ecef', borderRadius: '20px', fontSize: '0.85rem', color: '#333' }}>
              {isLogin ? 'Secure Login' : 'New Member'}
            </span>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="auth-content" style={{ marginTop: '30px', maxWidth: '600px' }}>
          <section className="description-section">
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', color: '#333' }}>
              {isLogin ? 'Enter your credentials' : 'Fill in your details'}
            </h3>
            
            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              
              {!isLogin && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#444' }}>Username</label>
                  <input 
                    type="text" 
                    name="username" 
                    placeholder="Choose a username" 
                    value={formData.username} 
                    onChange={handleChange} 
                    required 
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#444' }}>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="name@example.com" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#444' }}>Password</label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Enter your password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                />
              </div>

              <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', width: '100%' }}>
                {isLogin ? 'Login to Dashboard' : 'Register Account'}
              </button>
            </form>

            {message && (
              <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', backgroundColor: message.includes('❌') ? '#f8d7da' : '#d4edda', color: message.includes('❌') ? '#721c24' : '#155724' }}>
                {message}
              </div>
            )}
          </section>

          <footer style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <p style={{ color: '#444', fontSize: '1rem' }}>
              {isLogin ? "Don't have an account yet? " : "Already have an account? "}
              <span 
                onClick={() => setIsLogin(!isLogin)} 
                style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
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