import { useNavigate } from 'react-router-dom';

const CategoryStats = ({ progress }) => {
  const navigate = useNavigate();

  if (!progress || progress.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📚</div>
        <div className="empty-state-title">Commencez à pratiquer</div>
        <div className="empty-state-text">
          Vos statistiques par catégorie apparaîtront ici
        </div>
      </div>
    );
  }

  const categoryIcons = {
    grammar: { icon: '📖', color: '#3b82f6' },
    conjugation: { icon: '✍️', color: '#8b5cf6' },
    vocabulary: { icon: '📚', color: '#10b981' },
    reading_comprehension: { icon: '📰', color: '#f59e0b' }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'average';
    return 'poor';
  };

  return (
    <div className="category-stats-grid">
      {progress.map((cat, index) => {
        const categoryInfo = categoryIcons[cat.category_slug] || { icon: '📚', color: '#111111' };
        const percentage = cat.completed_exercises > 0 
          ? Math.round((cat.completed_exercises / cat.total_exercises) * 100) 
          : 0;

        return (
          <div 
            key={index} 
            className="category-stat-card"
            onClick={() => navigate(`/exercice/${cat.category_slug}/${cat.level}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="category-header">
              <div 
                className="category-icon"
                style={{ background: `${categoryInfo.color}15`, color: categoryInfo.color }}
              >
                {categoryInfo.icon}
              </div>
              <div className="category-name">{cat.category_name}</div>
            </div>
            
            <div className="category-score">
              {Math.round(cat.average_score || 0)}%
            </div>
            
            <div className="category-progress">
              {cat.completed_exercises} / {cat.total_exercises} exercices • Niveau {cat.level}
            </div>
            
            <div className="progress-bar-small">
              <div 
                className="progress-fill-small"
                style={{ width: `${percentage}%`, background: categoryInfo.color }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryStats;