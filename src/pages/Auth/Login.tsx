// Login Page Component
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [useMagicLink, setUseMagicLink] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    
    const { signIn, signUp, signInWithMagicLink, loading, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            if (useMagicLink) {
                await signInWithMagicLink(email);
                setMagicLinkSent(true);
            } else if (isSignUp) {
                await signUp(email, password);
                navigate('/');
            } else {
                await signIn(email, password);
                navigate('/');
            }
        } catch {
            // Error is handled by context
        }
    };

    if (magicLinkSent) {
        return (
            <div className="login-page">
                <div className="login-card">
                    <div className="magic-link-sent">
                        <div className="sent-icon">✉️</div>
                        <h2>Check your email</h2>
                        <p>We sent a magic link to <strong>{email}</strong></p>
                        <p className="text-muted">Click the link in the email to sign in.</p>
                        <button 
                            className="btn btn-ghost" 
                            onClick={() => setMagicLinkSent(false)}
                        >
                            Use a different email
                        </button>
                    </div>
                </div>
                <style>{styles}</style>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo">
                        <span className="logo-icon">🚀</span>
                        <span className="logo-text">Lead Skylab</span>
                    </div>
                    <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
                    <p className="text-muted">
                        {isSignUp 
                            ? 'Start validating your product-market fit' 
                            : 'Sign in to continue to your dashboard'}
                    </p>
                </div>

                {error && (
                    <div className="error-alert">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    {!useMagicLink && (
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="btn btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : (
                            useMagicLink 
                                ? 'Send Magic Link' 
                                : (isSignUp ? 'Create Account' : 'Sign In')
                        )}
                    </button>
                </form>

                <div className="divider">
                    <span>or</span>
                </div>

                <button 
                    className="btn btn-ghost btn-full"
                    onClick={() => {
                        setUseMagicLink(!useMagicLink);
                        clearError();
                    }}
                >
                    {useMagicLink ? 'Use password instead' : 'Sign in with Magic Link'}
                </button>

                <div className="login-footer">
                    {isSignUp ? (
                        <p>
                            Already have an account?{' '}
                            <button 
                                className="link-btn" 
                                onClick={() => { setIsSignUp(false); clearError(); }}
                            >
                                Sign in
                            </button>
                        </p>
                    ) : (
                        <p>
                            Don't have an account?{' '}
                            <button 
                                className="link-btn" 
                                onClick={() => { setIsSignUp(true); clearError(); }}
                            >
                                Create one
                            </button>
                        </p>
                    )}
                </div>
            </div>

            <style>{styles}</style>
        </div>
    );
};

const styles = `
    .login-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--gray-950) 0%, var(--gray-900) 100%);
        padding: var(--spacing-4);
    }

    .login-card {
        width: 100%;
        max-width: 420px;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-2xl);
        padding: var(--spacing-8);
    }

    .login-header {
        text-align: center;
        margin-bottom: var(--spacing-6);
    }

    .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-2);
        margin-bottom: var(--spacing-4);
    }

    .logo-icon {
        font-size: 2rem;
    }

    .logo-text {
        font-size: 1.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .login-header h1 {
        font-size: 1.5rem;
        margin: 0 0 var(--spacing-2);
    }

    .error-alert {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        padding: var(--spacing-3) var(--spacing-4);
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: var(--radius-lg);
        color: #f87171;
        font-size: 0.875rem;
        margin-bottom: var(--spacing-4);
    }

    .login-form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
    }

    .form-group label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--gray-300);
    }

    .form-group input {
        padding: var(--spacing-3) var(--spacing-4);
        background: var(--gray-800);
        border: 1px solid var(--gray-700);
        border-radius: var(--radius-lg);
        color: var(--gray-100);
        font-size: 1rem;
        transition: all 0.2s;
    }

    .form-group input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    .btn-full {
        width: 100%;
        padding: var(--spacing-3) var(--spacing-4);
    }

    .divider {
        display: flex;
        align-items: center;
        gap: var(--spacing-4);
        margin: var(--spacing-5) 0;
        color: var(--gray-500);
        font-size: 0.875rem;
    }

    .divider::before,
    .divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--gray-700);
    }

    .login-footer {
        text-align: center;
        margin-top: var(--spacing-6);
        color: var(--gray-400);
        font-size: 0.875rem;
    }

    .link-btn {
        background: none;
        border: none;
        color: var(--primary);
        cursor: pointer;
        font-size: inherit;
        padding: 0;
    }

    .link-btn:hover {
        text-decoration: underline;
    }

    .magic-link-sent {
        text-align: center;
        padding: var(--spacing-4);
    }

    .sent-icon {
        font-size: 3rem;
        margin-bottom: var(--spacing-4);
    }

    .magic-link-sent h2 {
        margin: 0 0 var(--spacing-2);
    }

    .magic-link-sent p {
        margin: 0 0 var(--spacing-4);
    }
`;

export default Login;
