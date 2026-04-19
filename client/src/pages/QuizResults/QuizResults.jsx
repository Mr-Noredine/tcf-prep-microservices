import { useLocation, useNavigate } from 'react-router-dom';
import '../../styles/exerciceView.css'; // Réutilise les styles results

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total, category, level, timeElapsed } = location.state || {};

  if (!score && score !== 0) {
    navigate('/quiz');
    return null;
  }

  const percentage = Math.round((score / total) * 100);
  const circumference = 2 * Math.PI * 75;
  const offset = circumference - (percentage / 100) * circumference;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}min ${secs}s`;
  };

  const getMessage = () => {
    if (percentage >= 90) return {
      title: 'Excellent !',
      message: 'Vous maîtrisez parfaitement ce niveau. Passez au niveau supérieur !'
    };
    if (percentage >= 70) return {
      title: 'Très bien !',
      message: 'Bonne maîtrise du niveau. Continuez à vous entraîner.'
    };
    if (percentage >= 50) return {
      title: 'Bien !',
      message: 'Vous êtes sur la bonne voie. Quelques révisions et ce sera parfait !'
    };
    return {
      title: 'Continuez vos efforts !',
      message: 'Revoyez les bases de ce niveau et refaites le quiz.'
    };
  };

  const message = getMessage();

  return (
    <div className="exercise-view-container">
      <div className="results-container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#111111' }}>
          Quiz Terminé !
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#757575', marginBottom: '3rem' }}>
          {category?.name} • Niveau {level}
        </p>

        {/* Score Circle */}
        <div className="results-score">
          <svg width="200" height="200" className="score-circle-bg">
            <circle cx="100" cy="100" r="75" stroke="#e5e5e5" strokeWidth="12" fill="none" />
            <circle 
              cx="100" 
              cy="100" 
              r="75" 
              stroke="#111111" 
              strokeWidth="12" 
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="score-circle"
            />
          </svg>
          <div className="score-text">
            {percentage}%
            <div className="score-label">Score</div>
          </div>
        </div>

        {/* Message */}
        <div style={{ 
          textAlign: 'center', 
          margin: '2rem 0 3rem',
          padding: '2rem',
          background: '#fafafa',
          borderRadius: '12px'
        }}>
          <h3 style={{ fontSize: '1.5rem', color: '#111111', marginBottom: '0.5rem' }}>
            {message.title}
          </h3>
          <p style={{ fontSize: '1rem', color: '#757575' }}>
            {message.message}
          </p>
        </div>

        {/* Stats */}
        <div className="results-stats">
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#10b981' }}>{score}</div>
            <div className="stat-label">Correct</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#ef4444' }}>
              {total - score}
            </div>
            <div className="stat-label">Incorrect</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{total}</div>
            <div className="stat-label">Questions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>
              {formatTime(timeElapsed)}
            </div>
            <div className="stat-label">Temps</div>
          </div>
        </div>

        {/* Actions */}
        <div className="results-actions">
          <button 
            onClick={() => navigate('/quiz', { 
              state: { category, level } 
            })} 
            className="btn-primary btn-large"
          >
            Recommencer
          </button>
          <button 
            onClick={() => navigate('/quiz')} 
            className="btn-secondary btn-large"
          >
            Nouveau quiz
          </button>
          <button 
            onClick={() => navigate('/exercices')} 
            className="btn-secondary btn-large"
          >
            Exercices
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;