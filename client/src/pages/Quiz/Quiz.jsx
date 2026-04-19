import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exercisesService } from '../../services/exercisesService';

const Quiz = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await exercisesService.getCategories();
      setCategories(data.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleStartQuiz = () => {
    if (selectedCategory && selectedLevel) {
      navigate('/quiz/active', {
        state: {
          category: selectedCategory,
          level: selectedLevel
        }
      });
    }
  };

  return (
    <>
      <section className="page-header">
        <h1>Quiz TCF</h1>
        <p>Évaluez vos compétences avec un quiz adapté à votre niveau</p>
      </section>

      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 40px' }}>
        {/* Category Selection */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#111111' }}>
            Choisissez une catégorie
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '1.5rem',
                  background: selectedCategory?.id === cat.id ? '#111111' : '#fafafa',
                  color: selectedCategory?.id === cat.id ? '#ffffff' : '#111111',
                  border: '1.5px solid ' + (selectedCategory?.id === cat.id ? '#111111' : '#e5e5e5'),
                  borderRadius: '12px',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Level Selection */}
        {selectedCategory && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#111111' }}>
              Choisissez votre niveau
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
              {levels.map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  style={{
                    padding: '1rem',
                    background: selectedLevel === level ? '#111111' : '#ffffff',
                    color: selectedLevel === level ? '#ffffff' : '#111111',
                    border: '1.5px solid ' + (selectedLevel === level ? '#111111' : '#e5e5e5'),
                    borderRadius: '12px',
                    fontFamily: 'inherit',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Start Button */}
        {selectedCategory && selectedLevel && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button
              onClick={handleStartQuiz}
              style={{
                padding: '18px 56px',
                background: '#111111',
                color: '#ffffff',
                border: 'none',
                borderRadius: '30px',
                fontFamily: 'inherit',
                fontSize: '1.1rem',
                fontWeight: '500',
                cursor: 'pointer',
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#3d3d3d'}
              onMouseOut={(e) => e.target.style.background = '#111111'}
            >
              Commencer le quiz
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default Quiz;