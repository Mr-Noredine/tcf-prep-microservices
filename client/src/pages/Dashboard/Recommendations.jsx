import { Link } from 'react-router-dom';

const Recommendations = ({ recommendations }) => {
  if (!recommendations) return null;

  const { weakAreas, strongAreas, nextLevel } = recommendations;

  const recs = [];

  // Weak areas - need improvement
  weakAreas?.forEach(area => {
    recs.push({
      type: 'improve',
      title: `Améliorez-vous en ${area.name}`,
      text: `Votre score actuel est de ${Math.round(area.average_score)}% au niveau ${area.level}. Continuez à pratiquer pour progresser !`,
      action: 'Pratiquer',
      link: `/exercice/${area.slug}/${area.level}`
    });
  });

  // Strong areas - continue
  strongAreas?.forEach(area => {
    recs.push({
      type: 'continue',
      title: `Excellent en ${area.name} !`,
      text: `Vous maîtrisez bien cette catégorie avec ${Math.round(area.average_score)}% au niveau ${area.level}. Continuez !`,
      action: 'Continuer',
      link: `/exercice/${area.slug}/${area.level}`
    });
  });

  // Next level suggestions
  nextLevel?.forEach(area => {
    const currentLevel = area.level;
    const nextLevelMap = { 'A1': 'A2', 'A2': 'B1', 'B1': 'B2', 'B2': 'C1', 'C1': 'C2' };
    const suggestedLevel = nextLevelMap[currentLevel];
    
    if (suggestedLevel) {
      recs.push({
        type: 'level-up',
        title: `Passez au niveau ${suggestedLevel} en ${area.name}`,
        text: `Vous avez complété ${Math.round((area.completed_exercises / area.total_exercises) * 100)}% du niveau ${currentLevel} avec un score de ${Math.round(area.average_score)}%. Prêt pour le niveau supérieur ?`,
        action: 'Commencer',
        link: `/exercice/${area.slug}/${suggestedLevel}`
      });
    }
  });

  // If no recommendations
  if (recs.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">💡</div>
        <div className="empty-state-title">Pas de recommandations</div>
        <div className="empty-state-text">
          Complétez plus d'exercices pour obtenir des recommandations personnalisées
        </div>
      </div>
    );
  }

  // Show max 3 recommendations
  const displayRecs = recs.slice(0, 3);

  return (
    <div className="recommendations-grid">
      {displayRecs.map((rec, index) => (
        <div key={index} className="recommendation-card">
          <div className={`recommendation-type type-${rec.type}`}>
            {rec.type === 'improve' && '📈 À améliorer'}
            {rec.type === 'continue' && '✓ Continuer'}
            {rec.type === 'level-up' && '🚀 Niveau suivant'}
          </div>
          <div className="recommendation-title">{rec.title}</div>
          <div className="recommendation-text">{rec.text}</div>
          <Link to={rec.link} className="recommendation-action">
            {rec.action}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Recommendations;