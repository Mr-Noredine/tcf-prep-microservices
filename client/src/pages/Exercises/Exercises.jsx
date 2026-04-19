import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exercisesService } from '../../services/exercisesService';
import '../../styles/exercises.css';

const Exercises = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState('tous');
  const [loading, setLoading] = useState(true);

  const categoryIcons = {
    grammar: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    conjugation: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`,
    vocabulary: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    reading_comprehension: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [exercisesData, categoriesData] = await Promise.all([
        exercisesService.getGrouped(),
        exercisesService.getCategories()
      ]);
      
      setExercises(Object.values(exercisesData.data));
      setCategories(categoriesData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyLabel = (level) => {
    const levels = {
      'A1': { label: 'Facile', class: 'easy' },
      'A2': { label: 'Facile', class: 'easy' },
      'B1': { label: 'Moyen', class: 'medium' },
      'B2': { label: 'Moyen', class: 'medium' },
      'C1': { label: 'Difficile', class: 'hard' },
      'C2': { label: 'Difficile', class: 'hard' }
    };
    return levels[level] || { label: 'Moyen', class: 'medium' };
  };

  const filteredExercises = exercises.filter(pack => {
    if (activeFilter === 'tous') return true;
    return pack.category.slug === activeFilter;
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <p style={{ fontSize: '1.2rem', color: '#757575' }}>Chargement des exercices...</p>
      </div>
    );
  }

  return (
    <>
      <section className="page-header">
        <h1>Exercices</h1>
        <p>Testez vos connaissances avec nos exercices adaptés à votre niveau</p>
      </section>

      <section className="exercises-section">
        {/* Filters */}
        <div className="filters">
          <button
            className={`filter-btn ${activeFilter === 'tous' ? 'active' : ''}`}
            onClick={() => setActiveFilter('tous')}
          >
            Tous
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`filter-btn ${activeFilter === cat.slug ? 'active' : ''}`}
              onClick={() => setActiveFilter(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Exercises Grid */}
        <div className="exercises-grid">
          {filteredExercises.map((pack, index) => {
            const difficulty = getDifficultyLabel(pack.level);
            
            return (
              <div key={index} className="exercise-card">
                <div className="card-icon" style={{ color: pack.category.color }}>
                  <div dangerouslySetInnerHTML={{ __html: categoryIcons[pack.category.slug] }} />
                </div>
                
                <div className="card-header">
                  <span className="card-category">{pack.category.name}</span>
                  <span className="card-level">Niveau {pack.level}</span>
                </div>
                
                <h3 className="card-title">{pack.category.name} - {pack.level}</h3>
                <p className="card-description">{pack.count} questions disponibles</p>
                
                <div className="card-footer">
                  <span className={`card-difficulty badge-${difficulty.class}`}>
                    {difficulty.label}
                  </span>
                  <button 
                    className="btn-start"
                    onClick={() => navigate(`/exercice/${pack.category.slug}/${pack.level}`)}
                  >
                    Commencer
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredExercises.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '1.1rem', color: '#757575' }}>
              Aucun exercice disponible pour cette catégorie
            </p>
          </div>
        )}
      </section>
    </>
  );
};

export default Exercises;