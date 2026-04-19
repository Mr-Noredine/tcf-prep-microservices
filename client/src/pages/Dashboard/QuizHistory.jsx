const QuizHistory = ({ attempts }) => {
  if (!attempts || attempts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📝</div>
        <div className="empty-state-title">Aucun historique</div>
        <div className="empty-state-text">
          Complétez des exercices pour voir votre historique
        </div>
      </div>
    );
  }

  const getScoreClass = (percentage) => {
    if (percentage >= 80) return 'score-excellent';
    if (percentage >= 70) return 'score-good';
    if (percentage >= 50) return 'score-average';
    return 'score-poor';
  };

  const getScoreLabel = (percentage) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 70) return 'Bien';
    if (percentage >= 50) return 'Moyen';
    return 'À revoir';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}min ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="history-list">
      {attempts.map((attempt, index) => (
        <div key={index} className="history-item">
          <div className="history-info">
            <div className="history-title">
              {attempt.category_name || 'Quiz'} - Niveau {attempt.level || 'N/A'}
            </div>
            <div className="history-meta">
              {formatDate(attempt.completed_at)} • {attempt.score}/{attempt.max_score} points • {formatTime(attempt.time_spent)}
            </div>
          </div>
          <div className="history-score">
            <div className="score-badge">
              {Math.round(attempt.percentage)}%
            </div>
            <div className={`score-percentage ${getScoreClass(attempt.percentage)}`}>
              {getScoreLabel(attempt.percentage)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuizHistory;