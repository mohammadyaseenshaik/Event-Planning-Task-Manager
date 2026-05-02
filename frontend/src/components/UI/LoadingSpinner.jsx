const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const spinnerSize = size === 'sm' ? 20 : size === 'lg' ? 52 : 36;

  if (fullScreen) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" style={{ width: spinnerSize, height: spinnerSize }} />
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
      <div className="spinner" style={{ width: spinnerSize, height: spinnerSize }} />
    </div>
  );
};

export default LoadingSpinner;
