import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from './firebase';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css'; // Import custom CSS

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await set(ref(db, `users/${user.uid}`), {
          email: user.email,
          uid: user.uid,
          registrationTime: new Date().toISOString()
        });
        Swal.fire('Success!', 'Account created successfully!', 'success');
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        Swal.fire('Welcome!', 'Login successful!', 'success');
      }
      navigate('/');
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

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
        <div className="remember-forgot">
          

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
