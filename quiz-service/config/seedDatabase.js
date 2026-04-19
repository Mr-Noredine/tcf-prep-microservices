import pool from './database.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seed de la base de données...\n');

    // 1. Insertion des catégories
    console.log('📂 Insertion des catégories...');
    const categories = [
      { name: 'Grammaire', slug: 'grammar', icon_color: '#3b82f6' },
      { name: 'Conjugaison', slug: 'conjugation', icon_color: '#8b5cf6' },
      { name: 'Vocabulaire', slug: 'vocabulary', icon_color: '#10b981' },
      { name: 'Compréhension Écrite', slug: 'reading_comprehension', icon_color: '#f59e0b' }
    ];

    const categoryMap = {};
    for (const cat of categories) {
      const result = await client.query(
        `INSERT INTO categories (name, slug, icon_color) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (slug) DO UPDATE SET name = $1, icon_color = $3
         RETURNING id, slug`,
        [cat.name, cat.slug, cat.icon_color]
      );
      categoryMap[cat.slug] = result.rows[0].id;
      console.log(`  ✓ ${cat.name} (ID: ${result.rows[0].id})`);
    }

    // 2. Chargement et insertion des exercices depuis items.json
    console.log('\n📝 Chargement des exercices depuis items.json...');
    const itemsPath = path.join(__dirname, '../data/items.json');
    const itemsData = await fs.readFile(itemsPath, 'utf-8');
    const items = JSON.parse(itemsData);

    if (!items.items || !Array.isArray(items.items)) {
      throw new Error('Format items.json invalide');
    }

    console.log(`📊 ${items.items.length} exercices trouvés`);

    let inserted = 0;
    let skipped = 0;

    for (const item of items.items) {
      try {
        const categoryId = categoryMap[item.category_id];
        
        if (!categoryId) {
          console.warn(`  ⚠ Catégorie inconnue: ${item.category_id} - Exercice ignoré`);
          skipped++;
          continue;
        }

        await client.query(
          `INSERT INTO exercises (
            id, exam, level, category_id, subcategory, type, 
            prompt, context, choices, answer, explanation, 
            tags, difficulty, language
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO NOTHING`,
          [
            item.id,
            item.exam || 'TCF',
            item.level,
            categoryId,
            item.subcategory_id || null,
            item.type,
            item.prompt,
            item.context || null,
            item.choices ? JSON.stringify(item.choices) : null,
            item.answer,
            item.explanation,
            item.tags || [],
            item.difficulty || 1,
            item.language || 'fr'
          ]
        );
        inserted++;
        
        if (inserted % 50 === 0) {
          console.log(`  ⏳ ${inserted} exercices insérés...`);
        }
      } catch (err) {
        console.error(`  ❌ Erreur insertion exercice ${item.id}:`, err.message);
        skipped++;
      }
    }

    console.log(`\n✅ Seed terminé !`);
    console.log(`  ✓ Exercices insérés: ${inserted}`);
    console.log(`  ⚠ Exercices ignorés: ${skipped}`);

    // 3. Statistiques finales
    const stats = await client.query(`
      SELECT 
        c.name as category,
        level,
        COUNT(*) as count
      FROM exercises e
      JOIN categories c ON e.category_id = c.id
      GROUP BY c.name, level
      ORDER BY c.name, level
    `);

    console.log('\n📊 Répartition des exercices:');
    console.table(stats.rows);

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export default seedDatabase;
