# 🎓 TCF PREP - Frontend React

Application React moderne pour la préparation au Test de Connaissance du Français (TCF).

## 🚀 Démarrage Rapide

### 1. Installation des dépendances

```bash
npm install
```

### 2. Démarrer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

## 📁 Structure du Projet

```
client/
├── src/
│   ├── components/        # Composants réutilisables
│   │   ├── Header/
│   │   └── Footer/
│   ├── pages/            # Pages principales
│   │   ├── Home/         # Page d'accueil
│   │   ├── Auth/         # Login & Register
│   │   ├── Exercises/    # Liste des exercices
│   │   └── Quiz/         # Interface quiz
│   ├── contexts/         # State management (Context API)
│   │   └── AuthContext.jsx
│   ├── services/         # API calls
│   │   ├── exercisesService.js
│   │   └── quizService.js
│   ├── styles/           # CSS global et modules
│   │   ├── global.css
│   │   ├── auth.css
│   │   └── exercises.css
│   ├── App.jsx           # Composant principal
│   └── main.jsx          # Point d'entrée
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 Design System

### Palette de Couleurs (Nike-Style)
```css
--black: #111111
--gray: #757575
--light-bg: #fafafa
--border: #e5e5e5
```

### Icônes par Catégorie
- **Grammaire**: Bleu #3b82f6
- **Conjugaison**: Violet #8b5cf6
- **Vocabulaire**: Vert #10b981
- **Compréhension**: Orange #f59e0b

### Typographie
- **Police**: Montserrat (300, 400, 500, 600, 700)
- **Boutons**: border-radius 30px
- **Cartes**: border-radius 12px

## 🔧 Configuration

### API Backend

Le frontend est configuré pour communiquer avec le backend sur `http://localhost:5000`.

Configuration dans `vite.config.js` :

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    }
  }
}
```

## 📡 Services API

### AuthContext
Gestion globale de l'authentification :
- `login(email, password)` - Connexion
- `register(userData)` - Inscription
- `logout()` - Déconnexion
- `user` - Utilisateur connecté
- `isAuthenticated` - Statut connexion

### ExercisesService
```javascript
// Récupérer tous les exercices
exercisesService.getAll({ category, level, type, limit })

// Exercices groupés
exercisesService.getGrouped()

// Catégories
exercisesService.getCategories()

// Un exercice
exercisesService.getById(id)

// Soumettre une tentative
exercisesService.submitAttempt(data)
```

### QuizService
```javascript
// Obtenir questions
quizService.getQuestions(category, level, limit)

// Soumettre résultat
quizService.submitAttempt(data)
```

## 🛠️ Scripts Disponibles

```bash
# Démarrage développement (port 3000)
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Linter
npm run lint
```

## 🌐 Routes Disponibles

| Route | Composant | Description |
|-------|-----------|-------------|
| `/` | Home | Page d'accueil |
| `/auth` | Auth | Login / Register |
| `/exercices` | Exercises | Liste des exercices |
| `/quiz` | Quiz | Sélection et quiz |

## 📦 Dépendances

### Production
- `react` - Bibliothèque UI
- `react-dom` - React DOM
- `react-router-dom` - Routing
- `axios` - HTTP client

### Développement
- `vite` - Build tool
- `@vitejs/plugin-react` - Plugin React pour Vite

## 🔄 Workflow Développement

### 1. Backend (Terminal 1)
```bash
cd server
npm run dev
# → http://localhost:5000
```

### 2. Frontend (Terminal 2)
```bash
cd client
npm run dev
# → http://localhost:3000
```

## 🚀 Build & Déploiement

### Build Production
```bash
npm run build
```

Les fichiers optimisés seront dans `/dist`

### Preview Build Local
```bash
npm run preview
```

### Déploiement
- **Vercel**: Import GitHub repo
- **Netlify**: Drag & drop `/dist`
- **Autre**: Servir le dossier `/dist`

Variables d'environnement en production :
```env
VITE_API_URL=https://your-backend-api.com
```

## ✨ Fonctionnalités

✅ **Actuellement disponibles** :
- Page d'accueil avec hero et features
- Authentification (login/register)
- Liste des exercices avec filtres
- Sélection de quiz (catégorie + niveau)
- Design Nike-style préservé
- Navigation fluide (SPA)
- Responsive mobile

🚧 **À venir** :
- Interface de quiz active
- Vue détaillée d'un exercice
- Dashboard utilisateur
- Statistiques et progression
- Historique des tentatives

## 🐛 Debugging

### Le frontend ne se connecte pas au backend
```bash
# Vérifier que le backend tourne
curl http://localhost:5000/api/health

# Vérifier le proxy Vite dans vite.config.js
```

### Erreurs CORS
Le backend doit autoriser l'origine `http://localhost:3000` dans `server.js`.

### Build échoue
```bash
# Clear cache et reinstall
rm -rf node_modules dist
npm install
npm run build
```

## 📝 License

MIT © MOHAMMEDI Noureddine
