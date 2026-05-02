import { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import StatsCard from '../components/Dashboard/StatsCard';
import { StatusChart, PriorityChart } from '../components/Dashboard/Charts';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Badge from '../components/UI/Badge';
import { getStats, getTasks, getRecentUpdates } from '../services/taskService';
import { getEvents } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import {
  ListChecks, CheckCircle2, Clock, AlertTriangle, CalendarDays, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, tasksRes, eventsRes, updatesRes] = await Promise.all([
          getStats(),
          getTasks(),
          getEvents(),
          getRecentUpdates(),
        ]);
        setStats(statsRes.data.stats);
        setRecentTasks(tasksRes.data.tasks.slice(0, 6));
        setEvents(eventsRes.data.events.slice(0, 4));
        setRecentUpdates(updatesRes.data.updates);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="main-content"><LoadingSpinner fullScreen /></div>
    </div>
  );

  const statCards = [
    { 
      title: isAdmin ? 'Total Tasks' : 'My Tasks', 
      value: stats?.total ?? 0, 
      icon: ListChecks, 
      color: isAdmin ? 'indigo' : 'cyan', 
      subtitle: isAdmin ? 'All tasks' : 'Assigned to me' 
    },
    { 
      title: 'Completed', 
      value: stats?.completed ?? 0, 
      icon: CheckCircle2, 
      color: 'green', 
      subtitle: `${stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0}%` 
    },
    { 
      title: 'In Progress', 
      value: stats?.inProgress ?? 0, 
      icon: TrendingUp, 
      color: 'blue', 
      subtitle: 'Active' 
    },
    { 
      title: 'Overdue', 
      value: stats?.overdue ?? 0, 
      icon: AlertTriangle, 
      color: 'red', 
      subtitle: 'Need attention' 
    },
    { 
      title: isAdmin ? 'Global Events' : 'My Events', 
      value: events.length, 
      icon: CalendarDays, 
      color: isAdmin ? 'yellow' : 'indigo', 
      subtitle: isAdmin ? 'Total' : 'Participating' 
    },
    { 
      title: 'Pending', 
      value: stats?.todo ?? 0, 
      icon: Clock, 
      color: isAdmin ? 'indigo' : 'cyan', 
      subtitle: 'To Do' 
    },
  ];

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="main-content">
        <Navbar
          title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${user?.name?.split(' ')[0]}! 👋`}
          subtitle={isAdmin ? "Here's what's happening across all events." : "Here's your personal task overview."}
        />
        <div className="page-content">

          {/* Overdue alert */}
          {stats?.overdue > 0 && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <AlertTriangle size={18} color="#f87171" />
              <p style={{ fontSize: '0.875rem', color: '#f87171', fontWeight: 500 }}>
                You have <strong>{stats.overdue}</strong> overdue task{stats.overdue !== 1 ? 's' : ''} that need immediate attention!
              </p>
            </div>
          )}

          {/* Stats grid */}
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            {statCards.map((card) => <StatsCard key={card.title} {...card} />)}
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {stats && <StatusChart stats={stats} />}
            {stats && <PriorityChart stats={stats} />}
          </div>

          {/* Recent Activity (Updates) - New Section */}
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '1.5rem', marginBottom: '2.25rem', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.625rem', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <TrendingUp size={18} color="var(--brand-primary)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>Recent Activity</h3>
            </div>
            
            {recentUpdates.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No recent task updates yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentUpdates.map((update) => (
                  <div key={update._id} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderRadius: '16px', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
                    <div style={{ 
                      width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                      background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.9rem', fontWeight: 800, color: 'white'
                    }}>
                      {update.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{update.user?.name}</p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{format(new Date(update.createdAt), 'MMM dd, HH:mm')}</span>
                      </div>
                      <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        Added a note to <strong style={{ color: 'var(--color-accent-primary)' }}>{update.task?.title}</strong>:
                        <br />
                        <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>"{update.note}"</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent tasks + Upcoming events */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

            {/* Recent Tasks */}
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Recent Tasks</h3>
                <a href="/tasks" style={{ fontSize: '0.75rem', color: '#a5b4fc', textDecoration: 'none' }}>View all →</a>
              </div>
              {recentTasks.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No tasks yet</div>
              ) : (
                <div>
                  {recentTasks.map((task) => {
                    const isOverdue = task.status !== 'Completed' && new Date() > new Date(task.deadline);
                    return (
                      <div key={task._id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</p>
                          <p style={{ fontSize: '0.72rem', color: isOverdue ? '#f87171' : 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                            {isOverdue ? '⚠ Overdue · ' : ''}{task.event?.title}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                          <Badge priority={task.priority} />
                          <Badge status={task.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Recent Events</h3>
                <a href="/events" style={{ fontSize: '0.75rem', color: '#a5b4fc', textDecoration: 'none' }}>View all →</a>
              </div>
              {events.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No events yet</div>
              ) : (
                <div>
                  {events.map((event) => (
                    <div key={event._id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))',
                        border: '1px solid rgba(99,102,241,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <CalendarDays size={18} color="#a5b4fc" />
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                          {format(new Date(event.date), 'MMM dd, yyyy')} · {event.members?.length || 0} members
                        </p>
                      </div>
                      <Badge status={event.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
