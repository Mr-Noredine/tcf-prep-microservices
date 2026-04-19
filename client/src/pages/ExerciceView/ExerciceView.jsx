import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { exercisesService } from '../../services/exercisesService';
import '../../styles/exerciceView.css';

const ExerciceView = () => {
  const { category, level } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exercises, setExercises] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  // Timer par question
  const questionStartTime = useRef(Date.now());

  useEffect(() => {
    loadExercises();
  }, [category, level]);

  // Réinitialise le timer à chaque nouvelle question
  useEffect(() => {
    questionStartTime.current = Date.now();
  }, [currentIndex]);

  const loadExercises = async () => {
    try {
      const data = await exercisesService.getAll({ category, level, limit: 10 });
      setExercises(data.data);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentExercise = exercises[currentIndex];
  const progress = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0;

  const getCorrectIndex = (exercise) => {
    if (!exercise || exercise.type !== 'mcq') return -1;

    const choices = typeof exercise.choices === 'string'
      ? JSON.parse(exercise.choices)
      : exercise.choices;

    const correctAnswer = exercise.answer;

    if (typeof correctAnswer === 'number') return correctAnswer;
    if (!isNaN(parseInt(correctAnswer))) return parseInt(correctAnswer);
    return choices.findIndex(c => c.trim().toLowerCase() === correctAnswer.trim().toLowerCase());
  };

  const handleValidate = async () => {
    if (!currentExercise) return;

    let correct = false;
    const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000);

    if (currentExercise.type === 'mcq') {
      const correctIdx = getCorrectIndex(currentExercise);
      correct = selectedOption === correctIdx;
    } else if (currentExercise.type === 'fill_blank') {
      correct = userAnswer.trim().toLowerCase() === currentExercise.answer.trim().toLowerCase();
    }

    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) setScore(prev => prev + 1);

    // Soumettre la tentative au backend
    try {
      await exercisesService.submitAttempt({
        exerciseId: currentExercise.id,
        score: correct ? 1 : 0,
        maxScore: 1,
        percentage: correct ? 100 : 0,
        timeSpent,
        answers: [currentExercise.type === 'mcq' ? selectedOption : userAnswer]
      });
    } catch (err) {
      // Echec silencieux : ne pas bloquer l'utilisateur si la sauvegarde échoue
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetQuestion();
    } else {
      setShowResults(true);
    }
  };

  const resetQuestion = () => {
    setUserAnswer('');
    setSelectedOption(null);
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setShowResults(false);
    resetQuestion();
  };

  if (loading) {
    return (
      <div className="exercise-view-container">
        <p style={{ textAlign: 'center', color: '#757575', fontSize: '1.1rem' }}>
          Chargement des exercices...
        </p>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="exercise-view-container">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#111111' }}>
            Aucun exercice disponible
          </h2>
          <p style={{ color: '#757575', marginBottom: '2rem' }}>
            Il n'y a pas d'exercices pour cette catégorie et ce niveau.
          </p>
          <button onClick={() => navigate('/exercices')} className="btn-primary">
            Retour aux exercices
          </button>
        </div>
      </div>
    );
  }

  // Vue Résultats
  if (showResults) {
    const percentage = Math.round((score / exercises.length) * 100);
    const circumference = 2 * Math.PI * 75;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="exercise-view-container">
        <div className="results-container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#111111' }}>
            Résultats
          </h1>

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

          <div className="results-stats">
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#10b981' }}>{score}</div>
              <div className="stat-label">Correct</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#ef4444' }}>
                {exercises.length - score}
              </div>
              <div className="stat-label">Incorrect</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{exercises.length}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>

          <div className="results-actions">
            <button onClick={handleRestart} className="btn-primary btn-large">
              Recommencer
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary btn-large">
              Voir mon tableau de bord
            </button>
            <button
              onClick={() => navigate('/exercices')}
              className="btn-secondary btn-large"
            >
              Autres exercices
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vue Exercice
  const correctIndex = getCorrectIndex(currentExercise);

  return (
    <div className="exercise-view-container">
      <div className="exercise-header">
        <h1>{currentExercise?.category_name} - Niveau {currentExercise?.level}</h1>
        <p>Exercice {currentIndex + 1} sur {exercises.length}</p>
      </div>

      <div className="progress-container">
        <div className="progress-info">
          <span className="progress-text">Progression</span>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="question-card">
        <div className="question-number">
          Question {currentIndex + 1}
        </div>

        {currentExercise?.context && (
          <div className="question-context">{currentExercise.context}</div>
        )}

        <div className="question-prompt">{currentExercise?.prompt}</div>

        {currentExercise?.type === 'mcq' && currentExercise?.choices && (
          <div className="answers-grid">
            {(() => {
              const choices = typeof currentExercise.choices === 'string'
                ? JSON.parse(currentExercise.choices)
                : currentExercise.choices;

              return choices.map((choice, index) => {
                let className = 'answer-option';

                if (showFeedback) {
                  className += ' disabled';
                  if (index === selectedOption && isCorrect) className += ' correct';
                  else if (index === selectedOption && !isCorrect) className += ' incorrect';
                  else if (index === correctIndex) className += ' correct';
                } else if (index === selectedOption) {
                  className += ' selected';
                }

                return (
                  <button
                    key={index}
                    className={className}
                    onClick={() => !showFeedback && setSelectedOption(index)}
                  >
                    {choice}
                  </button>
                );
              });
            })()}
          </div>
        )}

        {currentExercise?.type === 'fill_blank' && (
          <div className="fill-blank-container">
            <input
              type="text"
              className={`fill-blank-input ${showFeedback ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !showFeedback && userAnswer.trim()) handleValidate();
              }}
              placeholder="Votre réponse..."
              disabled={showFeedback}
              autoFocus
            />
          </div>
        )}

        {showFeedback && (
          <div className={`feedback-zone ${isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="feedback-icon">{isCorrect ? '✓' : '✗'}</div>
            <div className="feedback-content">
              <div className="feedback-title">
                {isCorrect ? 'Correct !' : 'Incorrect'}
              </div>
              <div className="feedback-explanation">
                {currentExercise?.explanation}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="exercise-actions">
        <button className="btn-quit" onClick={() => navigate('/exercices')}>
          Quitter
        </button>

        {!showFeedback ? (
          <button
            className="btn-validate"
            onClick={handleValidate}
            disabled={
              (currentExercise?.type === 'mcq' && selectedOption === null) ||
              (currentExercise?.type === 'fill_blank' && !userAnswer.trim())
            }
          >
            Valider
          </button>
        ) : (
          <button className="btn-next" onClick={handleNext}>
            {currentIndex === exercises.length - 1 ? 'Voir les résultats' : 'Suivant'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ExerciceView;
