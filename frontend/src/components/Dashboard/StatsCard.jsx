const StatsCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorMap = {
    indigo: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', text: '#818cf8', glow: 'rgba(99,102,241,0.1)' },
    green: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', text: '#34d399', glow: 'rgba(16,185,129,0.1)' },
    yellow: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: '#fbbf24', glow: 'rgba(245,158,11,0.1)' },
    red: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', text: '#f87171', glow: 'rgba(239,68,68,0.1)' },
    blue: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', text: '#60a5fa', glow: 'rgba(59,130,246,0.1)' },
    cyan: { bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)', text: '#22d3ee', glow: 'rgba(6,182,212,0.1)' },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className="stats-card fade-in" style={{ 
      background: 'var(--color-bg-card)',
      border: `1px solid var(--color-border)`,
      borderRadius: '24px',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-md)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Subtle Glow Effect */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '40%',
        height: '40%',
        background: c.glow,
        filter: 'blur(40px)',
        borderRadius: '50%',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div className="stats-icon-wrapper" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
            <Icon size={24} color={c.text} />
          </div>
          {subtitle && (
            <span style={{ 
              fontSize: '0.725rem', 
              fontWeight: 600,
              color: c.text, 
              background: c.bg, 
              padding: '0.25rem 0.75rem', 
              borderRadius: '100px', 
              border: `1px solid ${c.border}` 
            }}>
              {subtitle}
            </span>
          )}
        </div>
        <div>
          <p style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem', fontWeight: 500 }}>{title}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
