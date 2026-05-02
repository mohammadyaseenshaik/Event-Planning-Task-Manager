import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import TaskCard from '../components/Tasks/TaskCard';
import TaskForm from '../components/Tasks/TaskForm';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import { getEvents } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const TasksPage = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterEvent, setFilterEvent] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (filterEvent) params.event = filterEvent;
      if (search) params.search = search;
      const res = await getTasks(params);
      setTasks(res.data.tasks);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, filterEvent, search]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { getEvents().then((r) => setEvents(r.data.events)).catch(() => {}); }, []);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      const res = await createTask(data);
      setTasks((p) => [res.data.task, ...p]);
      setShowModal(false);
      toast.success('Task created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      setTasks((p) => p.filter((t) => t._id !== id));
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

  const clearFilters = () => {
    setSearch(''); setFilterStatus(''); setFilterPriority(''); setFilterEvent('');
  };

  const hasFilters = search || filterStatus || filterPriority || filterEvent;

  const selectStyle = { background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', padding: '0.6rem 0.875rem', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer', outline: 'none' };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Tasks" subtitle={`${tasks.length} task${tasks.length !== 1 ? 's' : ''} found`} />
        <div className="page-content">

          {/* Toolbar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder="Search tasks..." />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <SlidersHorizontal size={15} style={{ color: 'var(--color-text-muted)' }} />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
                <option value="">All Statuses</option>
                <option>To Do</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={selectStyle}>
                <option value="">All Priorities</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)} style={selectStyle}>
                <option value="">All Events</option>
                {events.map((ev) => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
              </select>
              {hasFilters && (
                <button className="btn-secondary" onClick={clearFilters} style={{ padding: '0.6rem 0.875rem', fontSize: '0.8rem' }}>
                  Clear
                </button>
              )}
            </div>

            {isAdmin && (
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={16} />
                New Task
              </button>
            )}
          </div>

          {/* Tasks grid */}
          {loading ? (
            <LoadingSpinner />
          ) : tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <p style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>No tasks found</p>
              <p style={{ fontSize: '0.875rem' }}>{hasFilters ? 'Try adjusting your filters.' : isAdmin ? 'Create your first task!' : 'No tasks assigned to you yet.'}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={setEditTask}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Task" size="lg">
        <TaskForm onSubmit={handleCreate} onCancel={() => setShowModal(false)} loading={saving} />
      </Modal>
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="lg">
        {editTask && <TaskForm initialData={editTask} onSubmit={handleUpdate} onCancel={() => setEditTask(null)} loading={saving} />}
      </Modal>
    </div>
  );
};

export default TasksPage;
