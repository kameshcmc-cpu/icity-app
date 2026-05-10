import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  async function handleGoogle(credentialResponse) {
    setError('');
    const result = await loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="ICity" className="h-12 w-12 rounded-xl object-cover" onError={e => { e.target.style.display='none'; }} />
          <div>
            <div className="text-white text-2xl font-bold">ICity</div>
            <div className="text-blue-300 text-sm">Business Manager</div>
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Streamline your<br />business operations
          </h2>
          <p className="text-blue-200 text-lg">
            Manage inventory, quotations, orders, invoices and payments — all in one place.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { icon: '📦', label: 'Inventory Tracking' },
              { icon: '📋', label: 'Quotation Workflows' },
              { icon: '🧾', label: 'Invoice Generation' },
              { icon: '📊', label: 'Business Analytics' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2 bg-brand-800 rounded-lg px-3 py-2">
                <span>{f.icon}</span>
                <span className="text-blue-100 text-sm">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-400 text-sm">© {new Date().getFullYear()} ICity Technologies</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img src="/logo.jpg" alt="ICity" className="h-10 w-10 rounded-xl object-cover" onError={e => { e.target.style.display='none'; }} />
            <span className="text-2xl font-bold text-brand-900">ICity Business Manager</span>
          </div>

          <div className="card">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
            <p className="text-gray-500 text-sm mb-8">Sign in to your account to continue</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col items-center gap-4">
              <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
                <GoogleLogin
                  onSuccess={handleGoogle}
                  onError={() => setError('Google sign-in failed. Please try again.')}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  width={280}
                  text="signin_with"
                  shape="rectangular"
                />
              </div>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="animate-spin h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing you in...
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                By signing in, you agree to our terms of service.<br />
                Access is managed by your organisation administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
