import { useState, useEffect } from 'react';
import { getAllUsers } from '../../services/authService';
import { getEvents } from '../../services/eventService';
import { getTaskUpdates, addTaskUpdate } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const TaskForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const { isAdmin, user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    deadline: '',
    event: '',
    assignedTo: '',
    ...initialData,
    deadline: initialData?.deadline ? initialData.deadline.slice(0, 10) : '',
    event: initialData?.event?._id || initialData?.event || '',
    assignedTo: initialData?.assignedTo?._id || initialData?.assignedTo || '',
  });

  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    getAllUsers().then((r) => setUsers(r.data.users)).catch(() => {});
    getEvents().then((r) => setEvents(r.data.events)).catch(() => {});
    
    if (initialData?._id) {
      getTaskUpdates(initialData._id).then((r) => setUpdates(r.data.updates)).catch(() => {});
    }
  }, [initialData]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const res = await addTaskUpdate(initialData._id, { note: newNote });
      setUpdates((p) => [...p, res.data.update]);
      setNewNote('');
      toast.success('Note added');
    } catch {
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' };
  const groupStyle = { display: 'flex', flexDirection: 'column', gap: '0.4rem' };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={groupStyle}>
        <label style={labelStyle}>Title *</label>
        <input name="title" value={form.title} onChange={handleChange} required className="input-field" placeholder="Enter task title..." disabled={!isAdmin} />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="input-field" rows={3} placeholder="Describe the task..." style={{ resize: 'vertical' }} disabled={!isAdmin} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={groupStyle}>
          <label style={labelStyle}>Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="input-field">
            <option>To Do</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>
        <div style={groupStyle}>
          <label style={labelStyle}>Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange} className="input-field" disabled={!isAdmin}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Deadline *</label>
        <input type="date" name="deadline" value={form.deadline} onChange={handleChange} required className="input-field" disabled={!isAdmin} />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Event *</label>
        <select name="event" value={form.event} onChange={handleChange} required className="input-field" disabled={!isAdmin}>
          <option value="">Select an event...</option>
          {events.map((ev) => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
        </select>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Assign To</label>
        <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="input-field" disabled={!isAdmin}>
          <option value="">Unassigned</option>
          {users.filter(u => u.role === 'member').map((u) => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </select>
      </div>

      {initialData?._id && (
        <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <MessageSquare size={16} color="var(--color-accent-primary)" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Updates & Notes</h3>
          </div>

          {/* Existing Updates */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {updates.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center', py: '1rem' }}>No updates yet.</p>
            ) : (
              updates.map((up) => (
                <div key={up._id} style={{ background: 'var(--color-bg-elevated)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent-primary)' }}>{up.user?.name}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{format(new Date(up.createdAt), 'MMM dd, HH:mm')}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{up.note}</p>
                </div>
              ))
            )}
          </div>

          {/* Add New Update */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a progress update..."
              className="input-field"
              rows={2}
              style={{ fontSize: '0.8rem', resize: 'none' }}
            />
            <button
              type="button"
              onClick={handleAddNote}
              disabled={addingNote || !newNote.trim()}
              className="btn-primary"
              style={{ padding: '0.75rem', borderRadius: '10px' }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
        <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
          {loading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default TaskForm;
