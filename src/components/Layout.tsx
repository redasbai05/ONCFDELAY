import { Outlet, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../context/store';
import { Train, LogOut, User, Bell, List } from 'lucide-react';
import clsx from 'clsx';

export const Layout = () => {
  const { currentUser, logout, notifications } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter(n => n.userId === currentUser?.id && !n.lue).length;

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = currentUser.role === 'admin' ? [
    { to: '/admin/voyages', label: 'Gestion Voyages' },
    { to: '/admin/retards', label: 'Déclarer Retard' }
  ] : [
    { to: '/voyages', label: 'Rechercher', icon: <Train size={18} /> },
    { to: '/mes-reservations', label: 'Mes Réservations', icon: <List size={18} /> }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <Train />
              ONCF Delay
            </div>
            <nav className="hidden md:flex space-x-4">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={clsx(
                    "flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === link.to ? "bg-white/20" : "hover:bg-white/10"
                  )}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <Link to="/notifications" className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white text-primary text-[10px] items-center justify-center font-bold">{unreadCount}</span>
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-2 text-sm">
                <User size={20} />
                <span className="hidden sm:inline">{currentUser.prenom} {currentUser.nom}</span>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Déconnexion">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
