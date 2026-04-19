# TCF Prep - Microservices

Application de préparation au TCF basée sur une architecture microservices :

- `auth-service` : authentification, utilisateurs, JWT.
- `quiz-service` : exercices, catégories, quiz et initialisation de la base.
- `client` : frontend React/Vite servi en local ou via Nginx dans Kubernetes.
- `k8s` : manifests Kubernetes, Ingress, RBAC, NetworkPolicies et Istio mTLS.

## Architecture

```text
                    +----------------------------------+
                    |     Ingress tcf-prep.local      |
                    |      nginx ingress controller    |
                    +----------+-------------+---------+
                               |             |
            /api/auth, /api/users            | /api/exercises, /api/quiz
                               |             |
                               v             v
                         +-----------+  +------------+
                         |   AUTH    |  |    QUIZ    |
                         | :5001     |  | :5002      |
                         +-----+-----+  +-----+------+
                               |              |
                               +------+-------+
                                      v
                              +---------------+
                              |  PostgreSQL   |
                              |     :5432     |
                              +---------------+
```

## Prérequis

### Outils obligatoires

- Git.
- Node.js `20.x` recommandé, avec `npm`.
- PostgreSQL `16` ou Docker pour lancer PostgreSQL localement.
- Docker Desktop ou Docker Engine.
- Un compte Docker Hub si vous voulez pousser les images.
- Minikube.
- `kubectl`.

### Outils pour la partie sécurité Kubernetes

- `istioctl` pour installer Istio et activer le mTLS.
  - Le dépôt contient `istio-1.29.2/`; vous pouvez ajouter son binaire au `PATH` :

```bash
export PATH="$PWD/istio-1.29.2/bin:$PATH"
istioctl version
```

- Un cluster qui applique les `NetworkPolicy`.
  - Pour Minikube, démarrez de préférence avec Calico si vous voulez réellement tester les règles réseau :

```bash
minikube start --cni=calico
```

Sans CNI compatible, les fichiers `k8s/network-policies.yml` peuvent être acceptés par Kubernetes mais ne pas bloquer le trafic.

## Configuration

Chaque backend utilise un fichier `.env`.

```bash
cp auth-service/.env.example auth-service/.env
cp quiz-service/.env.example quiz-service/.env
```

Variables importantes :

| Variable | Service | Description |
| --- | --- | --- |
| `PORT` | auth, quiz | Port HTTP du service. |
| `DB_HOST` | auth, quiz | Hôte PostgreSQL (`localhost` en local, `postgres-service` dans Kubernetes). |
| `DB_PORT` | auth, quiz | Port PostgreSQL, généralement `5432`. |
| `DB_NAME` | auth, quiz | Nom de la base, par défaut `tcf_prep_db`. |
| `DB_USER` | auth, quiz | Utilisateur PostgreSQL. |
| `DB_PASSWORD` | auth, quiz | Mot de passe PostgreSQL. |
| `JWT_SECRET` | auth, quiz | Secret JWT. Il doit être identique dans les deux services. |
| `JWT_EXPIRE` | auth | Durée de validité des tokens, par exemple `7d`. |
| `ALLOWED_ORIGINS` | auth, quiz | Origines autorisées par CORS, séparées par des virgules. |

Bonnes pratiques :

- Ne committez jamais les fichiers `.env`.
- Remplacez les valeurs d'exemple avant un déploiement réel.
- Utilisez un `JWT_SECRET` long et aléatoire.
- Ne réutilisez pas les secrets de développement en production.
- Ne committez pas `k8s/postgres-secret.yml`. Ce fichier est ignoré par Git.
- Versionnez uniquement `k8s/postgres-secret.example.yml`, qui contient des placeholders non sensibles.
- Les valeurs dans un `Secret` Kubernetes sont encodées en base64, mais ce n'est pas du chiffrement. Pour un vrai environnement, utilisez un gestionnaire de secrets ou générez le secret avec `kubectl create secret`.

Créer le fichier secret local depuis l'exemple :

```bash
cp k8s/postgres-secret.example.yml k8s/postgres-secret.yml
```

Encoder vos vraies valeurs :

```bash
echo -n 'votre_mot_de_passe_fort' | base64
echo -n 'votre_secret_jwt_fort' | base64
```

Copiez ensuite les deux valeurs générées dans `k8s/postgres-secret.yml`.

Créer un secret Kubernetes sans écrire les valeurs dans un fichier :

```bash
kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_PASSWORD='remplacer_par_un_mot_de_passe_fort' \
  --from-literal=JWT_SECRET='remplacer_par_un_secret_jwt_fort'
```

## Installation locale

### 1. Installer les dépendances

```bash
cd auth-service
npm install

cd ../quiz-service
npm install

cd ../client
npm install
```

### 2. Lancer PostgreSQL localement

Option avec Docker :

```bash
docker run --name tcf-postgres \
  -e POSTGRES_DB=tcf_prep_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:16-alpine
```

Si le conteneur existe déjà :

```bash
docker start tcf-postgres
```

### 3. Initialiser la base

```bash
cd quiz-service
npm run db:setup
npm run db:seed
```

### 4. Lancer les services

Terminal 1 :

```bash
cd auth-service
npm run dev
```

Terminal 2 :

```bash
cd quiz-service
npm run dev
```

Terminal 3 :

```bash
cd client
npm run dev
```

URLs locales :

- Auth service : `http://localhost:5001/api/health`
- Quiz service : `http://localhost:5002/api/health`
- Frontend : `http://localhost:3000`

Note : `client/vite.config.js` proxifie `/api` vers `http://localhost:5000`. Pour tester le frontend complet en local, utilisez un proxy/API gateway local sur `5000`, ou passez par Kubernetes avec l'Ingress `tcf-prep.local`.

## Scripts npm

### `auth-service`

```bash
npm run dev      # nodemon server.js
npm start        # node server.js
```

### `quiz-service`

```bash
npm run dev      # nodemon server.js
npm start        # node server.js
npm run db:setup # crée les tables
npm run db:seed  # insère les données initiales
```

### `client`

```bash
npm run dev      # serveur Vite sur le port 3000
npm run build    # build de production
npm run preview  # prévisualisation du build
npm run lint     # lint frontend si ESLint est installé/configuré
```

## Docker

Définissez votre identifiant Docker Hub :

```bash
export DOCKER_ID="votre_dockerhub_username"
```

Construire les images :

```bash
docker build -t "$DOCKER_ID/tcf-auth-service:1" auth-service
docker build -t "$DOCKER_ID/tcf-quiz-service:1" quiz-service
docker build -t "$DOCKER_ID/tcf-frontend:1" client
```

Tester les backends avec les `.env` locaux :

```bash
docker run --rm -p 5001:5001 --env-file auth-service/.env "$DOCKER_ID/tcf-auth-service:1"
docker run --rm -p 5002:5002 --env-file quiz-service/.env "$DOCKER_ID/tcf-quiz-service:1"
```

Publier sur Docker Hub :

```bash
docker login
docker push "$DOCKER_ID/tcf-auth-service:1"
docker push "$DOCKER_ID/tcf-quiz-service:1"
docker push "$DOCKER_ID/tcf-frontend:1"
```

## Déploiement Kubernetes manuel

### 1. Démarrer Minikube

```bash
minikube start --cni=calico
minikube addons enable ingress
```

### 2. Installer Istio si vous utilisez le mTLS

```bash
export PATH="$PWD/istio-1.29.2/bin:$PATH"
istioctl install --set profile=default -y
kubectl label namespace default istio-injection=enabled --overwrite
```

Après avoir activé l'injection Istio, redéployez les pods applicatifs pour obtenir les sidecars Envoy.

### 3. Mettre à jour les images

Les manifests de déploiement doivent pointer vers vos images Docker :

- `k8s/auth-deployment.yml`
- `k8s/quiz-deployment.yml`
- `k8s/frontend-deployment.yml`

Si les fichiers contiennent encore `TON_DOCKER_ID`, remplacez-le :

```bash
sed -i "s|TON_DOCKER_ID|$DOCKER_ID|g" k8s/auth-deployment.yml
sed -i "s|TON_DOCKER_ID|$DOCKER_ID|g" k8s/quiz-deployment.yml
sed -i "s|TON_DOCKER_ID|$DOCKER_ID|g" k8s/frontend-deployment.yml
```

Sur macOS, utilisez `sed -i ''` au lieu de `sed -i`.

### 4. Appliquer les manifests

Avant d'appliquer les manifests, créez le secret local si ce n'est pas déjà fait :

```bash
cp k8s/postgres-secret.example.yml k8s/postgres-secret.yml
```

Puis remplacez les valeurs base64 dans `k8s/postgres-secret.yml`.

```bash
kubectl apply -f k8s/rbac.yml
kubectl apply -f k8s/postgres-secret.yml
kubectl apply -f k8s/postgres-storage.yml
kubectl apply -f k8s/postgres-deployment.yml

kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s

kubectl apply -f k8s/auth-deployment.yml
kubectl apply -f k8s/quiz-deployment.yml
kubectl apply -f k8s/frontend-deployment.yml

kubectl wait --for=condition=ready pod -l app=auth-service --timeout=120s
kubectl wait --for=condition=ready pod -l app=quiz-service --timeout=120s
kubectl wait --for=condition=ready pod -l app=frontend --timeout=120s

kubectl apply -f k8s/ingress.yml
kubectl apply -f k8s/network-policies.yml
kubectl apply -f k8s/istio-mtls.yml
```

### 5. Initialiser la base dans Kubernetes

```bash
QUIZ_POD=$(kubectl get pod -l app=quiz-service -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it "$QUIZ_POD" -- node config/setupDatabase.js
kubectl exec -it "$QUIZ_POD" -- node config/seedDatabase.js
```

### 6. Configurer le host local

```bash
minikube ip
```

Ajoutez l'entrée suivante dans `/etc/hosts` sous Linux/macOS, ou dans `C:\Windows\System32\drivers\etc\hosts` sous Windows :

```text
<MINIKUBE_IP>  tcf-prep.local
```

Tester :

```bash
curl http://tcf-prep.local/
curl http://tcf-prep.local/api/auth/health
curl http://tcf-prep.local/api/exercises/categories
```

## Déploiement avec le script

Le script `deploy.sh` automatise :

- le build des images Docker,
- le push Docker Hub,
- le remplacement de `TON_DOCKER_ID` dans les manifests auth, quiz et frontend,
- le démarrage de Minikube si nécessaire,
- l'activation de l'Ingress,
- l'installation d'Istio si absent,
- l'application des manifests Kubernetes,
- l'application de RBAC, NetworkPolicies et mTLS.

Utilisation :

```bash
chmod +x deploy.sh
./deploy.sh votre_dockerhub_username
```

Avant de lancer le script :

- Vérifiez que Docker tourne.
- Exécutez `docker login`.
- Vérifiez que `kubectl`, `minikube` et `istioctl` sont disponibles.
- Si vous voulez que les NetworkPolicies soient appliquées, démarrez Minikube avec un CNI compatible comme Calico.

Attention : le script modifie les fichiers YAML avec `sed -i`. Si vous relancez le script avec un autre Docker ID, vérifiez les images dans `k8s/*.yml`.

## Sécurité

Le projet contient déjà plusieurs protections :

- `helmet` dans les services Express.
- CORS configuré via `ALLOWED_ORIGINS`.
- JWT pour les routes protégées.
- Mots de passe hachés avec `bcryptjs`.
- `Secret` Kubernetes pour PostgreSQL et JWT.
- `ServiceAccount`, `Role` et `RoleBinding` dédiés dans `k8s/rbac.yml`.
- `NetworkPolicy` pour limiter les flux réseau.
- Istio mTLS dans `k8s/istio-mtls.yml`.

Points à vérifier avant une démonstration ou un rendu :

- Remplacer tous les secrets d'exemple.
- Ne pas exposer PostgreSQL en `NodePort` ou `LoadBalancer`.
- Garder les services backend en `ClusterIP`.
- Limiter `ALLOWED_ORIGINS` à l'origine utilisée.
- Utiliser `NODE_ENV=production` en Kubernetes.
- Vérifier que les pods Istio ont bien deux conteneurs quand mTLS est activé :

```bash
kubectl get pods
kubectl describe pod <pod-name>
```

- Vérifier les NetworkPolicies :

```bash
kubectl get networkpolicy
kubectl describe networkpolicy auth-service-netpol
```

## Commandes utiles

```bash
# Etat global
kubectl get all
kubectl get pods -o wide
kubectl get ingress

# Logs
kubectl logs -l app=auth-service
kubectl logs -l app=quiz-service
kubectl logs -l app=frontend
kubectl logs -l app=postgres

# Entrer dans un pod
kubectl exec -it <pod-name> -- /bin/sh

# Redémarrer un déploiement
kubectl rollout restart deployment/auth-deployment
kubectl rollout restart deployment/quiz-deployment
kubectl rollout restart deployment/frontend-deployment

# Voir les événements
kubectl get events --sort-by=.metadata.creationTimestamp

# Supprimer les ressources du projet
kubectl delete -f k8s/

# Arrêter Minikube
minikube stop
```

## Dépannage

### `ImagePullBackOff`

Vérifiez que l'image existe sur Docker Hub et que le nom dans le manifest est correct :

```bash
kubectl describe pod <pod-name>
kubectl get deployment auth-deployment -o yaml | grep image:
```

### `CrashLoopBackOff`

Regardez les logs du pod :

```bash
kubectl logs <pod-name>
kubectl describe pod <pod-name>
```

Causes fréquentes :

- variables d'environnement manquantes,
- secret Kubernetes absent,
- PostgreSQL pas encore prêt,
- erreur de connexion DB.

### L'Ingress ne répond pas

```bash
minikube addons list | grep ingress
kubectl get ingress
kubectl get svc -n ingress-nginx
minikube ip
```

Vérifiez aussi l'entrée `tcf-prep.local` dans le fichier hosts.

### Le frontend local n'appelle pas les bons services

Le proxy Vite pointe vers `http://localhost:5000`. Lancez un reverse proxy local sur `5000`, modifiez temporairement `client/vite.config.js`, ou testez via l'Ingress Kubernetes.

## Structure du projet

```text
tcf-microservices/
├── auth-service/
│   ├── config/database.js
│   ├── controllers/
│   ├── middleware/auth.js
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── quiz-service/
│   ├── config/
│   │   ├── database.js
│   │   ├── setupDatabase.js
│   │   └── seedDatabase.js
│   ├── controllers/
│   ├── middleware/auth.js
│   ├── routes/
│   ├── data/items.json
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── client/
│   ├── src/
│   ├── nginx.conf
│   ├── vite.config.js
│   ├── package.json
│   └── Dockerfile
├── k8s/
│   ├── auth-deployment.yml
│   ├── frontend-deployment.yml
│   ├── ingress.yml
│   ├── istio-mtls.yml
│   ├── network-policies.yml
│   ├── postgres-deployment.yml
│   ├── postgres-secret.example.yml
│   ├── postgres-secret.yml
│   ├── postgres-storage.yml
│   ├── quiz-deployment.yml
│   └── rbac.yml
├── deploy.sh
└── README.md
```
