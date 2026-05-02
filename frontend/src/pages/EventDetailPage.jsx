import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import TaskCard from '../components/Tasks/TaskCard';
import TaskForm from '../components/Tasks/TaskForm';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Badge from '../components/UI/Badge';
import { getEvent, addMember, removeMember } from '../services/eventService';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import { getAllUsers } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ArrowLeft, Plus, UserPlus, UserMinus, Calendar, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [event, setEvent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, tasksRes, usersRes] = await Promise.all([
          getEvent(id),
          getTasks({ event: id }),
          isAdmin ? getAllUsers() : Promise.resolve({ data: { users: [] } }),
        ]);
        setEvent(eventRes.data.event);
        setTasks(tasksRes.data.tasks);
        setUsers(usersRes.data.users);
      } catch {
        toast.error('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isAdmin]);

  const handleCreateTask = async (data) => {
    setSaving(true);
    try {
      const res = await createTask({ ...data, event: id });
      setTasks((p) => [res.data.task, ...p]);
      setShowTaskModal(false);
      toast.success('Task created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTask = async (data) => {
    setSaving(true);
    try {
      const res = await updateTask(editTask._id, data);
      setTasks((p) => p.map((t) => t._id === editTask._id ? res.data.task : t));
      setEditTask(null);
      toast.success('Task updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks((p) => p.filter((t) => t._id !== taskId));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const res = await updateTask(taskId, { status });
      setTasks((p) => p.map((t) => t._id === taskId ? res.data.task : t));
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return toast.error('Select a user first');
    try {
      const res = await addMember(id, { userId: selectedUserId });
      setEvent(res.data.event);
      setSelectedUserId('');
      toast.success('Member added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const res = await removeMember(id, userId);
      setEvent(res.data.event);
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  if (loading) return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="main-content"><LoadingSpinner fullScreen /></div>
    </div>
  );

  if (!event) return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Event not found</p>
      </div>
    </div>
  );

  const nonMembers = users.filter((u) => u.role === 'member' && !event.members?.some((m) => m.user?._id === u._id));

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="main-content">
        <Navbar title={event.title} subtitle="Event Details" />
        <div className="page-content">

          {/* Back button + Event header */}
          <button className="btn-secondary" onClick={() => navigate('/events')} style={{ marginBottom: '1.5rem' }}>
            <ArrowLeft size={15} />
            Back to Events
          </button>

          {/* Event Info Card */}
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)' }} />
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <Badge status={event.status} />
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1rem', maxWidth: 600 }}>{event.description}</p>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    <Calendar size={14} />
                    {format(new Date(event.date), 'MMMM dd, yyyy')}
                  </div>
                  {event.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      <MapPin size={14} />
                      {event.location}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    <Users size={14} />
                    {event.members?.length || 0} members
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>

            {/* Tasks Column */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Tasks <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>({tasks.length})</span>
                </h2>
                {isAdmin && (
                  <button className="btn-primary" onClick={() => setShowTaskModal(true)}>
                    <Plus size={15} />
                    Add Task
                  </button>
                )}
              </div>

              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px', color: 'var(--color-text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
                  <p style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>No tasks yet</p>
                  {isAdmin && <p style={{ fontSize: '0.8rem' }}>Add the first task to this event</p>}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {tasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={setEditTask}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Members Sidebar */}
            <div>
              <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Team Members</h2>
                </div>

                {/* Add member (admin only) */}
                {isAdmin && nonMembers.length > 0 && (
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem' }}>
                    <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="input-field" style={{ fontSize: '0.78rem', padding: '0.5rem' }}>
                      <option value="">Add member...</option>
                      {nonMembers.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                    <button className="btn-primary" onClick={handleAddMember} style={{ padding: '0.5rem', flexShrink: 0 }}>
                      <UserPlus size={15} />
                    </button>
                  </div>
                )}

                {/* Member list */}
                <div>
                  {event.members?.map((m) => (
                    <div key={m.user?._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 700, color: 'white',
                      }}>
                        {m.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{m.user?.name}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{m.role}</p>
                      </div>
                      {isAdmin && (
                        <button onClick={() => handleRemoveMember(m.user?._id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '0.3rem', cursor: 'pointer', color: '#f87171', display: 'flex' }}>
                          <UserMinus size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task" size="lg">
        <TaskForm onSubmit={handleCreateTask} onCancel={() => setShowTaskModal(false)} loading={saving} initialData={{ event: id }} />
      </Modal>
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="lg">
        {editTask && <TaskForm initialData={editTask} onSubmit={handleUpdateTask} onCancel={() => setEditTask(null)} loading={saving} />}
      </Modal>
    </div>
  );
};

export default EventDetailPage;
