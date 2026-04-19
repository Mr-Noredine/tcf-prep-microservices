const StatsCards = ({ stats }) => {
  if (!stats) return null;

  const { overall } = stats;

  const cards = [
    {
      icon: '📊',
      value: overall?.total_attempts || 0,
      label: 'Exercices complétés',
      trend: null
    },
    {
      icon: '✓',
      value: `${Math.round(overall?.avg_score || 0)}%`,
      label: 'Score moyen',
      trend: (overall?.avg_score || 0) >= 70 ? 'up' : (overall?.avg_score || 0) >= 50 ? null : 'down'
    },
    {
      icon: '⏱️',
      value: formatTime(overall?.total_time_spent || 0),
      label: 'Temps total',
      trend: null
    },
    {
      icon: '🎯',
      value: overall?.successful_count || 0,
      label: 'Exercices réussis (≥70%)',
      trend: 'up'
    }
  ];

  function formatTime(seconds) {
    if (!seconds) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) return `${hours}h${minutes}m`;
    if (minutes > 0) return `${minutes}min ${secs}s`;
    return `${secs}s`;
  }

  return (
    <div className="stats-grid">
      {cards.map((card, index) => (
        <div key={index} className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon">{card.icon}</div>
          </div>
          <div className="stat-card-value">{card.value}</div>
          <div className="stat-card-label">{card.label}</div>
          {card.trend && (
            <div className={`stat-card-trend trend-${card.trend}`}>
              {card.trend === 'up' ? '↑ En progression' : '↓ À améliorer'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsCards;