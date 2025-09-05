import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';
import { auth, db } from './firebase';
import './Login.css';
import logoImage from './assets/logo/log.png';

// Subscription Modal Component
function SubscriptionModal({ show, onSubscribe, onClose }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content dark-mode">
        <div className="modal-header">
          <h3>Premium Subscription Required</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>Your free trial has ended. Subscribe to continue using our services.</p>
          <div className="subscription-plans">
            <div className="plan">
              <h4>Monthly Plan</h4>
              <p className="price">$9.99/month</p>
              <ul>
                <li>Full access to all features</li>
                <li>Priority support</li>
                <li>Cancel anytime</li>
              </ul>
              <button className="subscribe-btn" onClick={() => onSubscribe('monthly')}>
                Subscribe Now
              </button>
            </div>
            <div className="plan recommended">
              <div className="recommended-badge">Best Value</div>
              <h4>Annual Plan</h4>
              <p className="price">$99.99/year</p>
              <ul>
                <li>Full access to all features</li>
                <li>Priority support</li>
                <li>2 months free compared to monthly</li>
              </ul>
              <button className="subscribe-btn" onClick={() => onSubscribe('annual')}>
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSignUp, setIsSignUp] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const navigate = useNavigate();

  // Check subscription status on app load
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = ref(db, `users/${user.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            
            // Check if user has active subscription
            if (!userData.subscription || userData.subscription.status !== 'active') {
              // Check if user has exceeded free trial period (15 days)
              const signupDate = localStorage.getItem('signupDate');
              if (signupDate) {
                const signupTime = parseInt(signupDate);
                const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000; // 15 days in milliseconds
                const currentTime = Date.now();
                
                if (currentTime - signupTime > fifteenDaysInMs) {
                  setShowSubscriptionModal(true);
                }
              } else {
                // First time user, set signup date
                localStorage.setItem('signupDate', Date.now().toString());
              }
            }
          }
        } else {
          // For demo purposes, check if we should show the modal based on localStorage
          const signupDate = localStorage.getItem('signupDate');
          if (signupDate) {
            const signupTime = parseInt(signupDate);
            const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;
            const currentTime = Date.now();
            
            if (currentTime - signupTime > fifteenDaysInMs) {
              setShowSubscriptionModal(true);
            }
          } else {
            localStorage.setItem('signupDate', Date.now().toString());
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, []);

  // Handle redirect result from Google sign-in
  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          await handleGoogleSignInResult(result);
        }
      } catch (error) {
        handleGoogleSignInError(error);
      }
    };

    handleAuthRedirect();
  }, []);

  const handleGoogleSignInResult = async (result) => {
    const user = result.user;

    if (!user) {
      navigate('/login');
      return;
    }

    // Store user details in localStorage
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userName', user.displayName || user.email.split('@')[0]);
    localStorage.setItem('userId', user.uid); // Store user ID
    
    // Set signup date for new users
    if (!localStorage.getItem('signupDate')) {
      localStorage.setItem('signupDate', Date.now().toString());
    }

    const userRef = ref(db, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      await set(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || '',
        provider: 'google',
        createdAt: new Date().toISOString(),
        role: 'user',
        branch: 'main',
        enabled: true,
        subscription: {
          status: 'trial',
          plan: 'free',
          trialEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days trial
        }
      });
    }

    navigate('/settings');
  };

  const handleGoogleSignInError = (error) => {
    console.error('Google sign-in error:', error);
    let errorMessage = 'Google sign-in failed. Please try again.';

    if (error.code === 'auth/account-exists-with-different-credential') {
      errorMessage = 'This email is already registered with another method.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in window was closed. Please try again.';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Google sign-in is not enabled in Firebase. Please contact support.';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup was blocked. Please allow popups for this site.';
    } else if (error.code === 'auth/redirect-cancelled-by-user') {
      errorMessage = 'Sign-in was cancelled. Please try again.';
    }

    setErrors({ form: errorMessage });
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');

      // Detect if mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Use redirect method for mobile
        await signInWithRedirect(auth, provider);
      } else {
        // Use popup for desktop
        const result = await signInWithPopup(auth, provider);
        await handleGoogleSignInResult(result);
      }
    } catch (error) {
      handleGoogleSignInError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+\d{1,3})?\d{10,15}$/; // Basic international phone number validation

    if (!email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(email)) newErrors.email = 'Invalid email address';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (isSignUp) {
      if (!firstName) newErrors.firstName = 'First name is required';
      if (!lastName) newErrors.lastName = 'Last name is required';
      if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      
      // Phone number validation (required field)
      if (!phoneNumber) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (!phoneRegex.test(phoneNumber)) {
        newErrors.phoneNumber = 'Please enter a valid phone number (10-15 digits)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        throw new Error('auth/user-not-found');
      }

      // Store user details in localStorage
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.displayName || user.email.split('@')[0]);
      localStorage.setItem('userId', user.uid); // Store user ID
      
      // Set signup date if it doesn't exist
      if (!localStorage.getItem('signupDate')) {
        localStorage.setItem('signupDate', Date.now().toString());
      }

      navigate('/settings');
    } catch (error) {
      setIsLoading(false);
      let errorMessage = 'Login failed. Please try again.';

      switch (error.code || error.message) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Account disabled';
          break;
      }

      setErrors({ form: errorMessage });
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in database
      const userRef = ref(db, `users/${user.uid}`);
      await set(userRef, {
        uid: user.uid,
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        displayName: `${firstName} ${lastName}`,
        photoURL: '',
        provider: 'email',
        createdAt: new Date().toISOString(),
        role: 'user',
        branch: 'main',
        enabled: true,
        subscription: {
          status: 'trial',
          plan: 'free',
          trialEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days trial
        }
      });

      // Store user details in localStorage
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', `${firstName} ${lastName}`);
      localStorage.setItem('phoneNumber', phoneNumber);
      localStorage.setItem('userId', user.uid); // Store user ID
      localStorage.setItem('signupDate', Date.now().toString());

      navigate('/settings');
    } catch (error) {
      setIsLoading(false);
      let errorMessage = 'Sign up failed. Please try again.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
      }

      setErrors({ form: errorMessage });
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      // In a real application, you would integrate with a payment processor here
      // For demo purposes, we'll just update the user's subscription status
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        await set(userRef, {
          ...user,
          subscription: {
            status: 'active',
            plan: plan,
            subscribedAt: new Date().toISOString(),
            expiresAt: plan === 'monthly' 
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
              : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 365 days
          }
        });
        
        setShowSubscriptionModal(false);
        alert('Subscription successful! Thank you for your purchase.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('There was an error processing your subscription. Please try again.');
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);
  const toggleSignUpMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setConfirmPassword('');
  };

  // Check if user is on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div className="login-container dark-mode">
      <SubscriptionModal 
        show={showSubscriptionModal}
        onSubscribe={handleSubscribe}
        onClose={() => setShowSubscriptionModal(false)}
      />
      
      <div className="login-content">
        <div className="login-form-container dark-form">
          <h2 className="login-title">{isSignUp ? 'Create an account' : 'Sign in to your account'}</h2>
          <p className="login-subtitle">{isSignUp ? 'to get started with ERP Home' : 'to access your ERP Home'}</p>

          {errors.form && (
            <div className="alert alert-danger">
              {errors.form}
              {errors.form.includes('Google') && (
                <div className="troubleshooting-tips">
                  <p>If the problem persists:</p>
                  <ul>
                    <li>Refresh the page</li>
                    <li>Check your internet connection</li>
                    {isMobile ? (
                      <>
                        <li>Make sure you're using Chrome browser</li>
                        <li>Enable third-party cookies in settings</li>
                        <li>Clear browser cache and cookies</li>
                      </>
                    ) : (
                      <li>Allow popups for this site</li>
                    )}
                    <li>Try a different browser</li>
                    <li>Contact support if issue continues</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
            {isSignUp && (
              <div className="name-fields">
                <div className="form-group floating-label">
                  <input
                    type="text"
                    id="firstName"
                    className={`form-control dark-input ${errors.firstName ? 'is-invalid' : ''}`}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="firstName">First Name</label>
                  {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                </div>

                <div className="form-group floating-label">
                  <input
                    type="text"
                    id="lastName"
                    className={`form-control dark-input ${errors.lastName ? 'is-invalid' : ''}`}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="lastName">Last Name</label>
                  {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                </div>
              </div>
            )}

            <div className="form-group floating-label">
              <input
                type="email"
                id="email"
                className={`form-control dark-input ${errors.email ? 'is-invalid' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required
              />
              <label htmlFor="email">Email address</label>
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            {isSignUp && (
              <div className="form-group floating-label">
                <input
                  type="tel"
                  id="phoneNumber"
                  className={`form-control dark-input ${errors.phoneNumber ? 'is-invalid' : ''}`}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder=" "
                  required
                />
                <label htmlFor="phoneNumber">Phone Number</label>
                {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
              </div>
            )}

            <div className="form-group floating-label">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className={`form-control dark-input ${errors.password ? 'is-invalid' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
              />
              <label htmlFor="password">Password</label>
              <span className="password-toggle" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            {isSignUp && (
              <div className="form-group floating-label">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className={`form-control dark-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder=" "
                  required
                />
                <label htmlFor="confirmPassword">Confirm Password</label>
                <span className="password-toggle" onClick={toggleConfirmPasswordVisibility}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              </div>
            )}

            <button type="submit" className="login-btn dark-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                isSignUp ? 'Sign up' : 'Sign in'
              )}
            </button>
          </form>

          <div className="login-divider dark-divider">
            <span>or</span>
          </div>

          <div className="social-login dark-text">
            <p>{isSignUp ? 'Sign up with Google' : 'First time user? Sign up with Google'}</p>
            <button 
              onClick={handleGoogleSignIn} 
              className="google-signin-btn" 
              disabled={isLoading}
            >
              <span className="google-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
              </span>
              {isLoading ? 'Signing in...' : (isSignUp ? 'Sign up with Google' : 'Sign up with Google')}
            </button>
          </div>

          <div className="auth-switch dark-text">
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
              <button type="button" className="switch-btn" onClick={toggleSignUpMode}>
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>

        <div className="login-info dark-info">
          <div className="logo-container">
            <img src={logoImage} alt="ERP Logo" className="logo-image" />
          </div>
          <h2>EXPLORATION</h2>
          <p>
            ERP is the backbone of business efficiency — integrating data, people, 
            and processes into a single source of truth.
          </p>
          <div className="trial-info">
            <p>✨ <strong>15-day free trial</strong> for new users</p>
            <p>Subscribe to continue after trial period</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;