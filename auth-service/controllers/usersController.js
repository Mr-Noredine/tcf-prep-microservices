import pool from '../config/database.js';

// ═══════════════════════════════════════════════════════════
// GET USER PROGRESS
// ═══════════════════════════════════════════════════════════
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT 
        up.*,
        c.name as category_name,
        c.slug as category_slug,
        c.icon_color
      FROM user_progress up
      JOIN categories c ON up.category_id = c.id
      WHERE up.user_id = $1
      ORDER BY c.name, up.level`,
      [userId]
    );
    
    res.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la progression'
    });
  }
};

// ═══════════════════════════════════════════════════════════
// GET USER ATTEMPTS HISTORY
// ═══════════════════════════════════════════════════════════
export const getUserAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;
    
    const result = await pool.query(
      `SELECT 
        ea.*,
        e.prompt as exercise_prompt,
        e.level,
        c.name as category_name,
        c.slug as category_slug
      FROM exercise_attempts ea
      LEFT JOIN exercises e ON ea.exercise_id = e.id
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE ea.user_id = $1
      ORDER BY ea.completed_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching user attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique'
    });
  }
};

// ═══════════════════════════════════════════════════════════
// GET USER STATS
// ═══════════════════════════════════════════════════════════
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await pool.query(
      `SELECT
        COUNT(DISTINCT exercise_id) as total_exercises_completed,
        COUNT(*) as total_attempts,
        AVG(percentage) as avg_score,
        SUM(time_spent) as total_time_spent,
        COUNT(CASE WHEN percentage >= 70 THEN 1 END) as successful_count
      FROM exercise_attempts
      WHERE user_id = $1`,
      [userId]
    );
    
    const categoryStats = await pool.query(
      `SELECT 
        c.name as category,
        COUNT(*) as attempts,
        AVG(ea.percentage) as avg_score
      FROM exercise_attempts ea
      JOIN exercises e ON ea.exercise_id = e.id
      JOIN categories c ON e.category_id = c.id
      WHERE ea.user_id = $1
      GROUP BY c.name
      ORDER BY c.name`,
      [userId]
    );
    
    res.json({
      success: true,
      overall: stats.rows[0],
      byCategory: categoryStats.rows
    });
    
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

// Get progress timeline (last 30 days)
export const getProgressTimeline = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        DATE(completed_at) as date,
        COUNT(*) as total_attempts,
        AVG(percentage) as avg_score,
        SUM(CASE WHEN percentage >= 70 THEN 1 ELSE 0 END) as successful_attempts
      FROM exercise_attempts
      WHERE user_id = $1
        AND completed_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(completed_at)
      ORDER BY date ASC
    `;

    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching progress timeline:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la progression'
    });
  }
};

// Get recommendations based on performance
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get weak areas (categories with < 60% success rate)
    const weakAreasQuery = `
      SELECT 
        c.name,
        c.slug,
        up.level,
        up.average_score,
        up.completed_exercises,
        up.total_exercises
      FROM user_progress up
      JOIN categories c ON up.category_id = c.id
      WHERE up.user_id = $1
        AND up.average_score < 60
        AND up.completed_exercises > 0
      ORDER BY up.average_score ASC
      LIMIT 3
    `;

    // Get strong areas (categories with >= 80% success rate)
    const strongAreasQuery = `
      SELECT 
        c.name,
        c.slug,
        up.level,
        up.average_score,
        up.completed_exercises
      FROM user_progress up
      JOIN categories c ON up.category_id = c.id
      WHERE up.user_id = $1
        AND up.average_score >= 80
        AND up.completed_exercises > 0
      ORDER BY up.average_score DESC
      LIMIT 3
    `;

    // Get suggested next level
    const nextLevelQuery = `
      SELECT 
        c.name,
        c.slug,
        up.level,
        up.average_score,
        up.completed_exercises,
        up.total_exercises
      FROM user_progress up
      JOIN categories c ON up.category_id = c.id
      WHERE up.user_id = $1
        AND up.average_score >= 75
        AND up.completed_exercises >= (up.total_exercises * 0.8)
      ORDER BY 
        CASE up.level
          WHEN 'A1' THEN 1
          WHEN 'A2' THEN 2
          WHEN 'B1' THEN 3
          WHEN 'B2' THEN 4
          WHEN 'C1' THEN 5
          WHEN 'C2' THEN 6
        END ASC
      LIMIT 3
    `;

    const [weakAreas, strongAreas, nextLevel] = await Promise.all([
      pool.query(weakAreasQuery, [userId]),
      pool.query(strongAreasQuery, [userId]),
      pool.query(nextLevelQuery, [userId])
    ]);

    res.json({
      success: true,
      data: {
        weakAreas: weakAreas.rows,
        strongAreas: strongAreas.rows,
        nextLevel: nextLevel.rows
      }
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des recommandations'
    });
  }
};