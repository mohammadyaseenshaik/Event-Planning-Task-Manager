import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Sun, Moon, CheckCircle2, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notificationService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Navbar = ({ title, subtitle }) => {
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        setNotifications(res.data.notifications);
      } catch (err) {
        console.error('Failed to fetch notifications');
      }
    };

    if (user) {
      fetchNotifications();
      // Poll every 30 seconds for new notifications
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const accentColor = isAdmin ? 'var(--role-admin-accent)' : 'var(--role-member-accent)';

  return (
    <header className="topbar glass-effect" style={{ 
      padding: '1.25rem 2.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-bg-glass)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>{title}</h1>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: '8px',
              background: `rgba(${isAdmin ? '139,92,246' : '6,182,212'}, 0.1)`,
              color: accentColor,
              border: `1px solid rgba(${isAdmin ? '139,92,246' : '6,182,212'}, 0.2)`,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {isAdmin ? 'Admin View' : 'Member View'}
            </span>
          </div>
          {subtitle && <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>{subtitle}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          background: 'var(--color-bg-elevated)', 
          border: '1px solid var(--color-border)', 
          borderRadius: '12px', 
          padding: '0.625rem 1.25rem',
          transition: 'all 0.2s ease'
        }} className="search-bar-pro">
          <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
          <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Search anything...</span>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
          <button 
            onClick={toggleTheme}
            style={{ 
              background: 'var(--color-bg-elevated)', 
              border: '1px solid var(--color-border)', 
              borderRadius: '12px', 
              padding: '0.625rem', 
              cursor: 'pointer', 
              color: 'var(--color-text-secondary)', 
              display: 'flex',
              transition: 'all 0.2s ease'
            }}
            className="btn-icon-pro"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div ref={dropdownRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ 
                background: 'var(--color-bg-elevated)', 
                border: '1px solid var(--color-border)', 
                borderRadius: '12px', 
                padding: '0.625rem', 
                cursor: 'pointer', 
                color: 'var(--color-text-secondary)', 
                display: 'flex', 
                position: 'relative',
                transition: 'all 0.2s ease'
              }} 
              className="btn-icon-pro"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{ 
                  position: 'absolute', 
                  top: -5, 
                  right: -5, 
                  minWidth: 18, 
                  height: 18, 
                  background: 'var(--brand-danger)', 
                  borderRadius: '50%', 
                  border: '2px solid var(--color-bg-secondary)',
                  color: 'white',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: 320,
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 1000,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllAsRead} style={{ fontSize: '0.75rem', color: 'var(--color-accent-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Mark all as read</button>
                  )}
                </div>
                <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      <CheckCircle2 size={32} style={{ marginBottom: '0.5rem', opacity: 0.2 }} />
                      <p style={{ fontSize: '0.8rem' }}>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n._id} 
                        onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                        style={{ 
                          padding: '1rem', 
                          borderBottom: '1px solid var(--color-border)', 
                          background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-elevated)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.05)'}
                      >
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <div style={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: '8px', 
                            background: 'rgba(99, 102, 241, 0.1)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <MessageSquare size={16} color="var(--color-accent-primary)" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.2rem' }}>{n.title}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, marginBottom: '0.4rem' }}>{n.message}</p>
                            <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{format(new Date(n.createdAt), 'MMM dd, HH:mm')}</p>
                          </div>
                          {!n.isRead && (
                            <div style={{ width: 8, height: 8, background: 'var(--brand-primary)', borderRadius: '50%', flexShrink: 0, marginTop: '0.25rem' }} />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{
          width: 38, height: 38, borderRadius: '12px',
          background: `linear-gradient(135deg, ${accentColor}, var(--brand-secondary))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.9rem', fontWeight: 800, color: 'white', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'transform 0.2s'
        }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
