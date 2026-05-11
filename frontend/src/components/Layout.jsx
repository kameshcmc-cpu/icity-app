import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pl-sidebar-width min-h-screen">
        <div className="p-margin-desktop">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
