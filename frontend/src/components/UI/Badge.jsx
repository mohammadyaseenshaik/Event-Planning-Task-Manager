const Badge = ({ status, priority }) => {
  const getDotColor = (type, val) => {
    if (type === 'status') {
      const colors = {
        'To Do': '#94a3b8',
        'In Progress': '#60a5fa',
        'Completed': '#34d399',
        'upcoming': '#60a5fa',
        'ongoing': '#34d399',
        'completed': '#34d399',
        'cancelled': '#f87171',
      };
      return colors[val] || '#94a3b8';
    }
    const priorityColors = { High: '#f87171', Medium: '#fbbf24', Low: '#34d399' };
    return priorityColors[val] || '#94a3b8';
  };

  if (status) {
    const map = {
      'To Do': 'badge badge-todo',
      'In Progress': 'badge badge-inprogress',
      'Completed': 'badge badge-completed',
      'upcoming': 'badge badge-inprogress',
      'ongoing': 'badge badge-completed',
      'completed': 'badge badge-completed',
      'cancelled': 'badge badge-high',
    };
    return (
      <span className={map[status] || 'badge badge-todo'} style={{ padding: '0.25rem 0.75rem', borderRadius: '100px', fontWeight: 700, fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: getDotColor('status', status) }} />
        {status}
      </span>
    );
  }

  if (priority) {
    const map = { High: 'badge badge-high', Medium: 'badge badge-medium', Low: 'badge badge-low' };
    return (
      <span className={map[priority]} style={{ padding: '0.25rem 0.75rem', borderRadius: '100px', fontWeight: 700, fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: getDotColor('priority', priority) }} />
        {priority}
      </span>
    );
  }
  return null;
};

export default Badge;
