import { format } from 'date-fns';
import { Edit2, Trash2, Users, Calendar, MapPin } from 'lucide-react';
import Badge from '../UI/Badge';
import { useAuth } from '../../context/AuthContext';

const EventCard = ({ event, onEdit, onDelete, onClick }) => {
  const { isAdmin } = useAuth();
  const isPast = new Date(event.date) < new Date();

  return (
    <div
      className="fade-in"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Decorative gradient top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.375rem' }}>{event.title}</h3>
          <Badge status={event.status} />
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onEdit(event)} style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            ><Edit2 size={14} /></button>
            <button onClick={() => onDelete(event._id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: '#f87171', display: 'flex' }}><Trash2 size={14} /></button>
          </div>
        )}
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {event.description}
      </p>

      {/* Meta info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: isPast ? '#f87171' : 'var(--color-text-muted)' }}>
          <Calendar size={13} />
          <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
          {isPast && <span style={{ color: '#f87171', fontSize: '0.7rem' }}>(Past)</span>}
        </div>
        {event.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            <MapPin size={13} />
            <span>{event.location}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
          <Users size={13} />
          <div style={{ display: 'flex', gap: '-4px' }}>
            {event.members?.slice(0, 3).map((m, i) => (
              <div key={i} style={{
                width: 22, height: 22, borderRadius: '50%', border: '2px solid var(--color-bg-card)',
                background: `hsl(${(i * 60 + 240) % 360}, 70%, 55%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', fontWeight: 700, color: 'white',
                marginLeft: i > 0 ? '-6px' : 0,
              }}>
                {m.user?.name?.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <span>{event.members?.length || 0} member{event.members?.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
