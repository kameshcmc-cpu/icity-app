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
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-container flex-col justify-between p-12 border-r border-outline-variant/20">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="ICity" className="h-12 w-12 rounded-xl object-cover" onError={e => { e.target.style.display = 'none'; }} />
          <div>
            <div className="text-on-surface text-xl font-bold">Icity Tech</div>
            <div className="text-on-surface-variant text-xs uppercase tracking-widest">Enterprise Suite</div>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-on-surface leading-tight mb-4">
            Streamline your<br />business operations
          </h2>
          <p className="text-on-surface-variant text-lg mb-10">
            Manage inventory, quotations, orders, invoices and payments — all in one place.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: 'inventory_2',   label: 'Inventory Tracking'    },
              { icon: 'request_quote', label: 'Quotation Workflows'   },
              { icon: 'receipt_long',  label: 'Invoice Generation'    },
              { icon: 'bar_chart',     label: 'Business Analytics'    },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3 glass-card px-4 py-3">
                <span className="material-symbols-outlined text-secondary text-xl">{f.icon}</span>
                <span className="text-on-surface text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-on-surface-variant text-xs">© {new Date().getFullYear()} ICity Technologies</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <img src="/logo.jpg" alt="ICity" className="h-10 w-10 rounded-xl object-cover" onError={e => { e.target.style.display = 'none'; }} />
            <span className="text-xl font-bold text-on-surface">Icity Tech</span>
          </div>

          <div className="glass-card p-8">
            <h1 className="text-2xl font-bold text-on-surface mb-1">Welcome back</h1>
            <p className="text-on-surface-variant text-sm mb-8">Sign in to your account to continue</p>

            {error && (
              <div className="mb-6 p-3 bg-error/10 border border-error/30 rounded-xl text-error text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            <div className="flex flex-col items-center gap-4">
              <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
                <GoogleLogin
                  onSuccess={handleGoogle}
                  onError={() => setError('Google sign-in failed. Please try again.')}
                  useOneTap={false}
                  theme="filled_black"
                  size="large"
                  width={280}
                  text="signin_with"
                  shape="rectangular"
                />
              </div>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg animate-spin text-secondary">refresh</span>
                  Signing you in...
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
              <p className="text-xs text-on-surface-variant">
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
