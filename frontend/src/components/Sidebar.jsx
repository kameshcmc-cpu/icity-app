import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/',           label: 'Dashboard',  icon: 'dashboard',             end: true },
  { to: '/customers',  label: 'Customers',  icon: 'group'                           },
  { to: '/suppliers',  label: 'Suppliers',  icon: 'local_shipping'                  },
  { to: '/products',   label: 'Products',   icon: 'inventory_2'                     },
  { to: '/inventory',  label: 'Inventory',  icon: 'warehouse'                       },
  { to: '/quotations', label: 'Quotations', icon: 'request_quote'                   },
  { to: '/orders',     label: 'Orders',     icon: 'shopping_cart'                   },
  { to: '/invoices',   label: 'Invoices',   icon: 'receipt_long'                    },
  { to: '/payments',   label: 'Payments',   icon: 'payments'                        },
  { to: '/reports',    label: 'Reports',    icon: 'bar_chart'                       },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <aside className="fixed left-0 top-0 h-screen w-sidebar-width bg-surface-container border-r border-outline-variant/20 flex flex-col py-8 z-50">
      {/* Brand */}
      <div className="px-8 mb-8">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="ICity" className="h-9 w-9 rounded-xl object-cover" onError={e => { e.target.style.display = 'none'; }} />
          <div>
            <h1 className="font-bold text-lg text-on-surface leading-tight">Icity Tech</h1>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest">Enterprise Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2">
        {nav.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-surface-container-high text-secondary border-r-4 border-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
              }`
            }
          >
            <span className="material-symbols-outlined text-xl">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-4 mt-6 space-y-2">
        {/* User */}
        <div className="glass-card p-3 flex items-center gap-3 mb-4">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full border-2 border-secondary/30 object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-primary-container flex items-center justify-center text-sm font-bold text-primary">
              {user?.name?.[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-on-surface truncate">{user?.name}</div>
            <div className="text-xs text-on-surface-variant capitalize truncate">{user?.role}</div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-on-surface-variant hover:bg-surface-container-highest hover:text-error rounded-xl text-sm transition-all"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
