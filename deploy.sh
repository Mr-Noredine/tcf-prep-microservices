#!/bin/bash

# ═══════════════════════════════════════════════════════════
# TCF Prep - Script de déploiement Kubernetes
# ═══════════════════════════════════════════════════════════

set -e

DOCKER_ID=${1:-"TON_DOCKER_ID"}

echo "╔════════════════════════════════════════════════╗"
echo "║   TCF Prep - Deploiement Kubernetes           ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

if [ "$DOCKER_ID" = "TON_DOCKER_ID" ]; then
  echo "Usage: ./deploy.sh <ton-docker-hub-username>"
  echo "   Exemple: ./deploy.sh noureddine078"
  exit 1
fi

echo "Docker Hub ID: $DOCKER_ID"
echo ""

# 1. Build des images Docker
echo "Construction des images Docker..."
cd auth-service
docker build -t $DOCKER_ID/tcf-auth-service:1 .
cd ../quiz-service
docker build -t $DOCKER_ID/tcf-quiz-service:1 .
cd ../client
docker build -t $DOCKER_ID/tcf-frontend:1 .
cd ..

# 2. Push sur Docker Hub
echo ""
echo "Publication sur Docker Hub..."
docker push $DOCKER_ID/tcf-auth-service:1
docker push $DOCKER_ID/tcf-quiz-service:1
docker push $DOCKER_ID/tcf-frontend:1

# 3. Mise à jour des fichiers YAML avec le bon Docker ID
echo ""
echo "Mise à jour des fichiers Kubernetes..."
sed -i "s|TON_DOCKER_ID|$DOCKER_ID|g" k8s/auth-deployment.yml
sed -i "s|TON_DOCKER_ID|$DOCKER_ID|g" k8s/quiz-deployment.yml
sed -i "s|TON_DOCKER_ID|$DOCKER_ID|g" k8s/frontend-deployment.yml

# 4. Démarrer Minikube si nécessaire
echo ""
echo "Vérification de Minikube..."
if ! minikube status | grep -q "Running"; then
  echo "   Démarrage de Minikube..."
  minikube start
fi

# 5. Activer Ingress + Istio
echo ""
echo "Activation de l'Ingress..."
minikube addons enable ingress

echo "Activation d'Istio (service mesh mTLS)..."
if ! kubectl get namespace istio-system &>/dev/null; then
  istioctl install --set profile=default -y
fi
kubectl label namespace default istio-injection=enabled --overwrite

# 6. Déployer dans l'ordre
echo ""
echo "Déploiement sur Kubernetes..."

echo "   1/8 RBAC..."
kubectl apply -f k8s/rbac.yml

echo "   2/8 Secrets..."
kubectl apply -f k8s/postgres-secret.yml

echo "   3/8 Stockage..."
kubectl apply -f k8s/postgres-storage.yml

echo "   4/8 PostgreSQL..."
kubectl apply -f k8s/postgres-deployment.yml

echo "   Attente PostgreSQL..."
kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s

echo "   5/8 Auth Service..."
kubectl apply -f k8s/auth-deployment.yml

echo "   6/8 Quiz Service..."
kubectl apply -f k8s/quiz-deployment.yml

echo "   Attente des services backend..."
kubectl wait --for=condition=ready pod -l app=auth-service --timeout=120s
kubectl wait --for=condition=ready pod -l app=quiz-service --timeout=120s

echo "   7/8 Frontend..."
kubectl apply -f k8s/frontend-deployment.yml

echo "   Attente du frontend..."
kubectl wait --for=condition=ready pod -l app=frontend --timeout=120s

echo "   8/8 Ingress..."
kubectl apply -f k8s/ingress.yml

echo "   Network Policies..."
kubectl apply -f k8s/network-policies.yml

echo "   mTLS Istio..."
kubectl apply -f k8s/istio-mtls.yml

# 7. Résultat
echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║   Déploiement terminé !                       ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
kubectl get all
echo ""
echo "Minikube IP: $(minikube ip)"
echo ""
echo "Ajouter dans /etc/hosts :"
echo "   $(minikube ip)  tcf-prep.local"
echo ""
echo "Tester :"
echo "   curl http://tcf-prep.local/api/auth/health"
echo "   curl http://tcf-prep.local/api/exercises/categories"
echo "   curl http://tcf-prep.local/"
