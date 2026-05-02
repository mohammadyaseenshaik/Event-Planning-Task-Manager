import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import EventCard from '../components/Events/EventCard';
import EventForm from '../components/Events/EventForm';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const EventsPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);

  const fetchEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(res.data.events);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      const res = await createEvent(data);
      setEvents((p) => [res.data.event, ...p]);
      setShowModal(false);
      toast.success('Event created successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      const res = await updateEvent(editEvent._id, data);
      setEvents((p) => p.map((e) => e._id === editEvent._id ? res.data.event : e));
      setEditEvent(null);
      toast.success('Event updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event? All associated tasks will remain.')) return;
    try {
      await deleteEvent(id);
      setEvents((p) => p.filter((e) => e._id !== id));
      toast.success('Event deleted');
    } catch {
      toast.error('Failed to delete event');
    }
  };

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Events" subtitle={`${events.length} total events`} />
        <div className="page-content">

          {/* Toolbar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search events..."
              />
            </div>
            {isAdmin && (
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={16} />
                New Event
              </button>
            )}
          </div>

          {/* Events grid */}
          {loading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <p style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>No events found</p>
              <p style={{ fontSize: '0.875rem' }}>{isAdmin ? 'Create your first event to get started!' : 'No events assigned to you yet.'}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {filtered.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onEdit={(e) => setEditEvent(e)}
                  onDelete={handleDelete}
                  onClick={() => navigate(`/events/${event._id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Event">
        <EventForm onSubmit={handleCreate} onCancel={() => setShowModal(false)} loading={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editEvent} onClose={() => setEditEvent(null)} title="Edit Event">
        {editEvent && (
          <EventForm initialData={editEvent} onSubmit={handleUpdate} onCancel={() => setEditEvent(null)} loading={saving} />
        )}
      </Modal>
    </div>
  );
};

export default EventsPage;
