import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import StatsCards from './StatsCards';
import ProgressChart from './ProgressChart';
import CategoryStats from './CategoryStats';
import QuizHistory from './QuizHistory';
import Recommendations from './Recommendations';
import '../../styles/dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, progressData, attemptsData, timelineData, recsData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getProgress(),
        dashboardService.getAttempts(10, 0),
        dashboardService.getTimeline(),
        dashboardService.getRecommendations()
      ]);

      setStats(statsData);
      setProgress(progressData.data || []);
      setAttempts(attemptsData.data || []);
      setTimeline(timelineData.data || []);
      setRecommendations(recsData.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <p style={{ textAlign: 'center', color: '#757575', fontSize: '1.1rem', paddingTop: '4rem' }}>
          Chargement de votre tableau de bord...
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Tableau de bord</h1>
        <p>Bienvenue, {user?.firstname} ! Voici votre progression</p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Progress Chart */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Progression</h2>
        </div>
        <ProgressChart timeline={timeline} />
      </div>

      {/* Category Stats */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Performance par catégorie</h2>
        </div>
        <CategoryStats progress={progress} />
      </div>

      {/* Recommendations */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Recommandations personnalisées</h2>
        </div>
        <Recommendations recommendations={recommendations} />
      </div>

      {/* Quiz History */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Historique récent</h2>
        </div>
        <QuizHistory attempts={attempts} />
      </div>
    </div>
  );
};

export default Dashboard;