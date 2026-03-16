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
        </div>
    );
};

export default Login;
