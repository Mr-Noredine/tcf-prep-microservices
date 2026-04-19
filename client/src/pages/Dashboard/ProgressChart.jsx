import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProgressChart = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📈</div>
        <div className="empty-state-title">Pas encore de données</div>
        <div className="empty-state-text">
          Complétez des exercices pour voir votre progression
        </div>
      </div>
    );
  }

  // Format data for chart
  const chartData = timeline.map(item => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    score: Math.round(parseFloat(item.avg_score) || 0),
    attempts: parseInt(item.total_attempts) || 0
  }));

  return (
    <div className="chart-container">
      <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1.5rem', color: '#111111' }}>
        Évolution du score (30 derniers jours)
      </h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis 
              dataKey="date" 
              stroke="#757575"
              style={{ fontSize: '0.85rem' }}
            />
            <YAxis 
              stroke="#757575"
              style={{ fontSize: '0.85rem' }}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{
                background: '#ffffff',
                border: '1.5px solid #e5e5e5',
                borderRadius: '8px',
                padding: '10px'
              }}
              labelStyle={{ color: '#111111', fontWeight: '600' }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#111111" 
              strokeWidth={2}
              dot={{ fill: '#111111', r: 4 }}
              activeDot={{ r: 6 }}
              name="Score moyen (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressChart;