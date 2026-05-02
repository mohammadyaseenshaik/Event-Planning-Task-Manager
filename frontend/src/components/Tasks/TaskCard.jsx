import { useState } from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, User, Calendar, Flag } from 'lucide-react';
import Badge from '../UI/Badge';
import { useAuth } from '../../context/AuthContext';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const { isAdmin, user } = useAuth();
  const [updating, setUpdating] = useState(false);

  const isOverdue = task.status !== 'Completed' && new Date() > new Date(task.deadline);
  const canEdit = isAdmin || task.assignedTo?.id === user?.id || task.assignedTo?._id === user?.id;

  const handleStatusChange = async (e) => {
    setUpdating(true);
    await onStatusChange(task._id, e.target.value);
    setUpdating(false);
  };

  return (
    <div
      className="fade-in"
      style={{
        background: 'var(--color-bg-card)',
        border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.4)' : 'var(--color-border)'}`,
        borderRadius: '14px',
        padding: '1.25rem',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {isOverdue && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #ef4444, #f87171)' }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem', lineHeight: 1.4 }}>{task.title}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            📁 {task.event?.title || 'Unknown Event'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          {canEdit && (
            <button onClick={() => onEdit(task)} style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.35rem', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
              title={isAdmin ? "Edit Task" : "View Details & Add Notes"}
            ><Edit2 size={13} /></button>
          )}
          {isAdmin && (
            <button onClick={() => onDelete(task._id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '0.35rem', cursor: 'pointer', color: '#f87171', display: 'flex', transition: 'all 0.2s' }}><Trash2 size={13} /></button>
          )}
        </div>
      </div>

      {task.description && (
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {task.description}
        </p>
      )}

      {/* Badges */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <Badge priority={task.priority} />
        <Badge status={task.status} />
        {isOverdue && <span className="badge badge-high">⚠ Overdue</span>}
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          <User size={12} />
          <span>{task.assignedTo?.name || 'Unassigned'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: isOverdue ? '#f87171' : 'var(--color-text-muted)' }}>
          <Calendar size={12} />
          <span>{task.deadline ? format(new Date(task.deadline), 'MMM dd, yyyy') : 'No deadline'}</span>
        </div>
      </div>

      {/* Status Selector */}
      {canEdit && (
        <select
          value={task.status}
          onChange={handleStatusChange}
          disabled={updating}
          className="input-field"
          style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      )}
    </div>
  );
};

export default TaskCard;
