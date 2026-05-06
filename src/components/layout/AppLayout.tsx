import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Search, Settings, LogOut, Briefcase, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/components/ThemeProvider';

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/auth/login');
  };

  const navItems = [
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/app/match', icon: Search, label: 'Match CV' },
    { to: '/app/cvs', icon: FileText, label: 'My CVs' },
    { to: '/app/applications', icon: Briefcase, label: 'Applications' },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground flex-col md:flex-row overflow-hidden transition-colors duration-300">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-60 bg-card border-r border-border flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight text-blue-950">
            <div className="bg-blue-950 text-white p-1.5 rounded-md">
              <FileText className="w-5 h-5" />
            </div>
            SyncRes
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-violet-100 text-violet-900'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-blue-950'}
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-1">
          <NavLink
            to="/app/settings"
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${isActive ? 'bg-violet-100 text-violet-900' : 'text-gray-600 hover:bg-gray-200 hover:text-blue-950'}
            `}
          >
            <Settings className="w-5 h-5" />
            Settings
          </NavLink>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log out
          </button>

          <div className="mt-4 px-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-950 text-white flex items-center justify-center font-medium text-xs">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-blue-950 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-14 bg-card border-b border-border flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            SyncRes
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="text-muted-foreground">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-xs">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden bg-card border-t border-border flex justify-around p-2 shrink-0 pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 p-2 rounded-lg min-w-[64px]
              ${isActive ? 'text-violet-600' : 'text-gray-500 hover:text-blue-950'}
            `}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
