import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from './firebase';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';
import loadingImage from './assets/loading-image.jpg'; // Ensure this image exists

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      setIsLoading(true);
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await set(ref(db, `users/${user.uid}`), {
          email: user.email,
          uid: user.uid,
          registrationTime: new Date().toISOString()
        });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      setTimeout(() => {
        setIsLoading(false);
        navigate('/');
      }, 9000);
      
    } catch (err) {
      setIsLoading(false);
      alert(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <img src={loadingImage} alt="Loading Background" className="fullscreen-bg" />
        <div className="welcome-message">Welcome to ERP by PTS</div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon"></div>
          <h3>{isRegistering ? 'Register' : ' Login'}</h3>
        </div>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email ID"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="login-btn" onClick={handleAuth}>
          {isRegistering ? 'Register' : 'Login'}
        </button>
        <p className="toggle-text">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button className="toggle-btn" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;