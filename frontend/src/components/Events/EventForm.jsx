import { useState } from 'react';

const EventForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    status: 'upcoming',
    ...initialData,
    date: initialData?.date ? initialData.date.slice(0, 10) : '',
  });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' };
  const groupStyle = { display: 'flex', flexDirection: 'column' };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={groupStyle}>
        <label style={labelStyle}>Event Title *</label>
        <input name="title" value={form.title} onChange={handleChange} required className="input-field" placeholder="Enter event name..." />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Description *</label>
        <textarea name="description" value={form.description} onChange={handleChange} required className="input-field" rows={3} placeholder="What is this event about?" style={{ resize: 'vertical' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={groupStyle}>
          <label style={labelStyle}>Date *</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required className="input-field" />
        </div>
        <div style={groupStyle}>
          <label style={labelStyle}>Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="input-field">
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Location</label>
        <input name="location" value={form.location} onChange={handleChange} className="input-field" placeholder="Event location (optional)..." />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
        <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
          {loading ? 'Saving...' : initialData ? 'Update Event' : 'Create Event'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default EventForm;
