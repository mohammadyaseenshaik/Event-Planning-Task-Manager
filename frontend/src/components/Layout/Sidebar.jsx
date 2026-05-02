import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, CalendarDays, CheckSquare, LogOut, Zap, Users, ChevronRight
} from 'lucide-react';

const navLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/events', icon: CalendarDays, label: 'Events' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
];

const Sidebar = () => {
  const { user, logoutUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const accentColor = isAdmin ? 'var(--role-admin-accent)' : 'var(--role-member-accent)';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
        <div style={{
          width: 42, height: 42, borderRadius: '14px',
          background: `linear-gradient(135deg, ${accentColor}, var(--brand-secondary))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 20px ${isAdmin ? 'rgba(139,92,246,0.3)' : 'rgba(6,182,212,0.3)'}`,
          transition: 'all 0.3s ease'
        }} className="logo-container">
          <Zap size={22} color="white" />
        </div>
        <div>
          <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>Ethara.ai</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{isAdmin ? 'Admin Portal' : 'Workspace'}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem', padding: '0 0.75rem', fontWeight: 700 }}>Overview</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{label}</span>
              <ChevronRight size={14} className="chevron" style={{ opacity: 0.4, transition: 'all 0.2s' }} />
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User profile */}
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.875rem', 
          padding: '1rem', 
          borderRadius: '16px', 
          background: 'var(--color-bg-elevated)', 
          marginBottom: '1rem',
          border: '1px solid var(--color-border)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '12px',
            background: `linear-gradient(135deg, ${accentColor}, var(--brand-secondary))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 800, color: 'white', flexShrink: 0,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <p style={{ 
              fontSize: '0.7rem', 
              color: accentColor, 
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {isAdmin ? '🛡 Admin' : '⭐ Member'}
            </p>
          </div>
        </div>
        <button className="btn-danger" style={{ width: '100%', justifyContent: 'center', borderRadius: '12px', padding: '0.875rem' }} onClick={handleLogout}>
          <LogOut size={16} />
          <span style={{ fontWeight: 600 }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
