import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/', label: 'Dashboard', icon: '▦', end: true },
  { to: '/customers', label: 'Customers', icon: '👥' },
  { to: '/suppliers', label: 'Suppliers', icon: '🏭' },
  { to: '/products', label: 'Products', icon: '📦' },
  { to: '/inventory', label: 'Inventory', icon: '🗄️' },
  { to: '/quotations', label: 'Quotations', icon: '📋' },
  { to: '/orders', label: 'Orders', icon: '🛒' },
  { to: '/invoices', label: 'Invoices', icon: '🧾' },
  { to: '/payments', label: 'Payments', icon: '💳' },
  { to: '/reports', label: 'Reports', icon: '📊' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <aside className="flex flex-col w-64 min-h-screen bg-brand-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-brand-800">
        <img src="/logo.jpg" alt="ICity" className="h-9 w-9 rounded-lg object-cover" onError={e => { e.target.style.display='none'; }} />
        <div>
          <div className="font-bold text-lg leading-tight">ICity</div>
          <div className="text-xs text-blue-300">Business Manager</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-600 text-white' : 'text-blue-100 hover:bg-brand-800 hover:text-white'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-brand-800">
        <div className="flex items-center gap-3 mb-3">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold">
              {user?.name?.[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs text-blue-300 truncate">{user?.role}</div>
          </div>
        </div>
        <button onClick={logout} className="w-full text-left text-xs text-blue-300 hover:text-white transition-colors px-1 py-1">
          Sign out
        </button>
      </div>
    </aside>
  );
}
