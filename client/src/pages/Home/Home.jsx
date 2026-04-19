import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Préparation au TCF</h1>
          <p className="hero-subtitle">
            Entraînement structuré du niveau A1 à C2 avec des exercices
            personnalisés et un suivi de progression
          </p>
          <div className="hero-cta">
            <Link to="/exercices" className="btn-primary btn-large">
              Commencer les exercices
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="content-grid">
          <div className="text-content">
            <h2>Une préparation complète et progressive</h2>
            <p>
              TCF Prep vous accompagne dans votre préparation au{' '}
              <strong>Test de Connaissance du Français</strong> avec une
              méthodologie éprouvée et des exercices adaptés à votre niveau.
            </p>
            <p>
              Que vous visiez le niveau <strong>A1</strong> ou <strong>C2</strong>,
              notre plateforme s'adapte à vos besoins avec des contenus
              pédagogiques structurés et un suivi personnalisé de votre
              progression.
            </p>
            <ul className="feature-list">
              <li>
                <span className="list-icon">✓</span>
                Plus de 200 exercices couvrant tous les niveaux du CECRL
              </li>
              <li>
                <span className="list-icon">✓</span>
                Exercices adaptatifs pour évaluer vos compétences en temps réel
              </li>
              <li>
                <span className="list-icon">✓</span>
                Explications détaillées pour chaque réponse
              </li>
              <li>
                <span className="list-icon">✓</span>
                Suivi de progression et statistiques personnalisées
              </li>
            </ul>
          </div>
          <div className="image-content">
            <img
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800"
              alt="Étudiant travaillant"
              className="feature-image"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Pourquoi choisir TCF Prep ?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3>Exercices structurés</h3>
            <p>
              Des centaines d'exercices organisés par catégorie et niveau pour
              une progression optimale
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3>Suivi en temps réel</h3>
            <p>
              Suivez votre progression avec des statistiques détaillées et des
              recommandations personnalisées
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>Feedback instantané</h3>
            <p>
              Obtenez des explications détaillées après chaque réponse pour
              comprendre vos erreurs
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3>Contenu adaptatif</h3>
            <p>
              Des exercices qui s'adaptent à votre niveau et vous aident à
              progresser efficacement
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section - visible uniquement si non connecté */}
      {!user && (
        <section className="cta-section">
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600"
            alt="Étudiants"
            className="cta-bg-image"
            loading="lazy"
          />
          <div className="cta-overlay"></div>
          <div className="cta-content">
            <h2>Prêt à commencer votre préparation ?</h2>
            <p>
              Rejoignez des milliers d'apprenants qui ont réussi leur TCF grâce à
              notre plateforme
            </p>
            <Link to="/auth" className="btn-primary btn-large">
              Créer un compte gratuit
            </Link>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;
